import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Post, CommentCreate, PostCreate, Comment } from '../../models/post.model';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { finalize, timeout, BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-posts',
  imports: [CommonModule, FormsModule],
  templateUrl: './posts.html',
  styleUrl: './posts.css',
})
export class Posts implements OnInit {
  posts: Post[] = [];
  loading$ = new BehaviorSubject<boolean>(true);
  error$ = new BehaviorSubject<string | null>(null);
  isModerator = false;
  currentUserId = 0;
  vibesByPostId: Record<number, { label: string; emoji: string }> = {};

  newPostTitle = '';
  newPostContent = '';
  isCreatingPost = false;

  // Track comment input for each post
  newCommentContent: { [postId: number]: string } = {};

  // Track which posts the user has liked
  likedPosts: Set<number> = new Set();

  // Track which comments are expanded
  expandedComments: Set<number> = new Set();

  constructor(
    private postService: PostService,
    private authService: AuthService
  ) {
    this.isModerator = this.authService.isModerator();
    const user = this.authService.currentUserValue;
    if (user) {
      this.currentUserId = user.id;
    }
  }

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.error$.next(null);
    this.loading$.next(true);

    this.postService.getPosts()
      .pipe(
        timeout(8000),
        finalize(() => {
          this.loading$.next(false);
        })
      )
      .subscribe({
        next: (posts) => {
          this.posts = posts
            .map(post => ({ ...post, comments: post.comments ?? [] }))
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          this.posts.forEach(post => {
            if (post.vibe_label && post.vibe_emoji) {
              this.vibesByPostId[post.id] = { label: post.vibe_label, emoji: post.vibe_emoji };
            } else {
              this.vibesByPostId[post.id] = this.computeVibe(post.comments);
            }
          });
        },
        error: (error) => {
          if (error?.status === 0) {
            this.error$.next('Unable to reach the server. Please try again.');
          } else if (error?.name === 'TimeoutError') {
            this.error$.next('Loading posts timed out. Please try again.');
          } else {
            this.error$.next('Failed to load posts.');
          }
          console.error('Error loading posts:', error);
        }
      });
  }

  createPost(): void {
    if (!this.newPostTitle.trim() || !this.newPostContent.trim()) {
      return;
    }

    const payload: PostCreate = {
      title: this.newPostTitle.trim(),
      content: this.newPostContent.trim()
    };

    this.isCreatingPost = true;
    this.postService.createPost(payload)
      .pipe(finalize(() => {
        this.isCreatingPost = false;
      }))
      .subscribe({
        next: (post) => {
          const normalized = { ...post, comments: post.comments ?? [] };
          this.posts = [normalized, ...this.posts];
          this.vibesByPostId[normalized.id] = this.computeVibe(normalized.comments);
          this.newPostTitle = '';
          this.newPostContent = '';
        },
        error: (error) => {
          console.error('Error creating post:', error);
          alert('Failed to create post. Please try again.');
        }
      });
  }

  getVibe(postId: number): { label: string; emoji: string } {
    return this.vibesByPostId[postId] || { label: 'Neutral', emoji: '😐' };
  }

  private computeVibe(comments: Comment[]): { label: string; emoji: string } {
    if (!comments.length) {
      return { label: 'Neutral', emoji: '😐' };
    }

    const buckets = {
      toxic: 0,
      constructive: 0,
      humorous: 0,
      informative: 0
    };

    const toxicWords = ['hate', 'stupid', 'idiot', 'dumb', 'trash', 'garbage', 'liar', 'scam'];
    const constructiveWords = ['agree', 'consider', 'suggest', 'recommend', 'improve', 'feedback', 'thanks'];
    const humorousWords = ['lol', 'lmao', 'haha', 'funny', 'joke', 'meme'];
    const informativeWords = ['source', 'evidence', 'data', 'study', 'report', 'facts', 'link'];

    let hasNumber = false;

    for (const comment of comments) {
      const text = comment.content.toLowerCase();
      if (/[0-9]/.test(text)) {
        hasNumber = true;
      }
      toxicWords.forEach(word => { if (text.includes(word)) buckets.toxic += 1; });
      constructiveWords.forEach(word => { if (text.includes(word)) buckets.constructive += 1; });
      humorousWords.forEach(word => { if (text.includes(word)) buckets.humorous += 1; });
      informativeWords.forEach(word => { if (text.includes(word)) buckets.informative += 1; });
    }

    const entries = Object.entries(buckets) as Array<[keyof typeof buckets, number]>;
    const [topKey, topValue] = entries.sort((a, b) => b[1] - a[1])[0];
    if (topValue === 0) {
      if (hasNumber) {
        return { label: 'Informative', emoji: '📚' };
      }
      return { label: 'Constructive', emoji: '✅' };
    }

    switch (topKey) {
      case 'toxic':
        return { label: 'Toxic', emoji: '⚠️' };
      case 'constructive':
        return { label: 'Constructive', emoji: '✅' };
      case 'humorous':
        return { label: 'Humorous', emoji: '😄' };
      case 'informative':
        return { label: 'Informative', emoji: '📚' };
      default:
        return { label: 'Neutral', emoji: '😐' };
    }
  }

  toggleComments(postId: number): void {
    if (this.expandedComments.has(postId)) {
      this.expandedComments.delete(postId);
    } else {
      this.expandedComments.add(postId);
    }
  }

  isCommentsExpanded(postId: number): boolean {
    return this.expandedComments.has(postId);
  }

  addComment(postId: number): void {
    const content = this.newCommentContent[postId];
    if (!content || !content.trim()) {
      return;
    }

    const comment: CommentCreate = { content: content.trim() };

    this.postService.createComment(postId, comment).subscribe({
      next: (newComment) => {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
          post.comments.push(newComment);
          this.vibesByPostId[postId] = this.computeVibe(post.comments);
        }
        this.newCommentContent[postId] = '';
      },
      error: (error) => {
        console.error('Error adding comment:', error);
        alert('Failed to add comment. Please try again.');
      }
    });
  }

  likePost(postId: number): void {
    if (this.likedPosts.has(postId)) {
      return; // Already liked
    }

    this.postService.likePost(postId).subscribe({
      next: () => {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
          post.likes_count++;
          this.likedPosts.add(postId);
        }
      },
      error: (error) => {
        console.error('Error liking post:', error);
        if (error.status === 400) {
          alert(error.error.detail || 'You have already liked this post');
        } else {
          alert('Failed to like post. Please try again.');
        }
      }
    });
  }

  hasLiked(postId: number): boolean {
    return this.likedPosts.has(postId);
  }

  markAsMisleading(postId: number): void {
    if (!this.isModerator) {
      return;
    }

    const post = this.posts.find(p => p.id === postId);
    if (!post) {
      return;
    }

    const newStatus = !post.is_misleading;

    this.postService.moderatePost(postId, newStatus).subscribe({
      next: () => {
        this.loadPosts();
        alert(`Post marked as ${newStatus ? 'misleading' : 'accurate'}`);
      },
      error: (error) => {
        console.error('Error moderating post:', error);
        alert('Failed to moderate post. Please try again.');
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }
}
