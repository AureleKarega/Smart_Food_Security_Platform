import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { CommunityService, CommunityPost } from '../../services/community';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-community',
  imports: [FormsModule, DatePipe],
  templateUrl: './community.html',
  styleUrl: './community.scss',
})
export class Community implements OnInit {
  posts = signal<CommunityPost[]>([]);
  newPostContent = '';
  newPostType = 'discussion';
  selectedFilter = '';
  loading = signal(true);

  postTypes = [
    { value: 'discussion', label: 'Discussion' },
    { value: 'tip', label: 'Food Tip' },
    { value: 'story', label: 'Impact Story' },
    { value: 'event', label: 'Event' }
  ];

  constructor(
    private communityService: CommunityService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    this.loading.set(true);
    this.communityService.getAllPosts(this.selectedFilter || undefined).subscribe({
      next: (res) => { this.posts.set(res.posts); this.loading.set(false); },
      error: () => { this.posts.set([]); this.loading.set(false); }
    });
  }

  createPost() {
    if (!this.newPostContent.trim()) return;
    this.communityService.createPost({
      content: this.newPostContent,
      type: this.newPostType
    }).subscribe({
      next: (res) => {
        this.posts.update(posts => [res.post, ...posts]);
        this.newPostContent = '';
      }
    });
  }

  likePost(post: CommunityPost) {
    this.communityService.likePost(post.id).subscribe({
      next: (res) => {
        this.posts.update(posts =>
          posts.map(p => p.id === post.id ? res.post : p)
        );
      }
    });
  }

  onFilterChange() {
    this.loadPosts();
  }

  getTypeLabel(type: string): string {
    return this.postTypes.find(t => t.value === type)?.label || type;
  }
}
