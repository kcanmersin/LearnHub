import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SavedWord {
  id: number;
  user_id: number;
  text: string;
  input_type: string;
  tag: string;
  created_at: string;
  explanation?: string;
  examples?: string[];
  usage_contexts?: string[];
}

@Component({
  selector: 'app-my-words',
  templateUrl: './my-words.component.html',
  styleUrls: ['./my-words.component.scss']
})
export class MyWordsComponent implements OnInit {

  allSavedWords: SavedWord[] = [];
  filteredWords: SavedWord[] = [];
  availableTags: string[] = [];
  selectedTag: string = 'all';
  isLoading: boolean = false;
  errorMessage: string = '';
  selectedWord: SavedWord | null = null;

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadSavedWords();
  }

  loadSavedWords(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.selectedWord = null;
    this.selectedTag = 'all';

    this.apiService.getSavedQueries().subscribe({
      next: (response: SavedWord[]) => {
        this.allSavedWords = response;
        this.filteredWords = [...this.allSavedWords];
        this.extractTags();
        this.isLoading = false;
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.detail || err.message || 'Failed to load saved words.';
        console.error('Error loading saved words:', err);
        this.isLoading = false;
      }
    });
  }

  extractTags(): void {
    const tags = new Set(this.allSavedWords.map(word => word.tag || 'general'));
    this.availableTags = ['all', ...Array.from(tags).sort()];
  }

  filterByTag(): void {
    if (this.selectedTag === 'all') {
      this.filteredWords = [...this.allSavedWords];
    } else {
      this.filteredWords = this.allSavedWords.filter(word => (word.tag || 'general') === this.selectedTag);
    }
    this.selectedWord = null;
  }

  showDetails(word: SavedWord): void {
      this.selectedWord = word;
  }

  closeDetails(): void {
      this.selectedWord = null;
  }
}
