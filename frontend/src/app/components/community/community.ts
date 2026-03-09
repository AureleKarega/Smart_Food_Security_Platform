import { Component, OnInit } from '@angular/core';
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
  posts: CommunityPost[] = [];
  newPostContent = '';
  newPostType = 'discussion';
  selectedFilter = '';
  loading = true;

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
    this.loading = true;
    this.communityService.getAllPosts(this.selectedFilter || undefined).subscribe({
      next: (res) => { this.posts = res.posts; this.loading = false; },
      error: () => { this.posts = []; this.loading = false; }
    });
  }

  createPost() {
    if (!this.newPostContent.trim()) return;
    this.communityService.createPost({
      content: this.newPostContent,
      type: this.newPostType
    }).subscribe({
      next: (res) => {
        this.posts.unshift(res.post);
        this.newPostContent = '';
      }
    });
  }

  likePost(post: CommunityPost) {
    this.communityService.likePost(post._id).subscribe({
      next: (res) => {
        const idx = this.posts.findIndex(p => p._id === post._id);
        if (idx !== -1) this.posts[idx] = res.post;
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
