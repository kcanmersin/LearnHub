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
        this.allSavedWords = this.processWordData(response);
        this.filteredWords = [...this.allSavedWords];
        this.extractTags();
        this.isLoading = false;
      },
      error: (err: any) => {
        this.isLoading = false;
        if (err?.status === 401) {
          this.errorMessage = 'Please log in to view your saved items';
        } else {
          this.errorMessage = err?.error?.detail ||
                             err?.message ||
                             'Failed to load your saved vocabulary';
        }
        console.error('Error loading saved words:', err);
      }
    });
  }

  private processWordData(words: SavedWord[]): SavedWord[] {
    return words.map(word => {
      // Ensure all properties have default values if missing
      return {
        ...word,
        tag: word.tag || 'general',
        explanation: word.explanation || 'No explanation available',
        examples: Array.isArray(word.examples) && word.examples.length ?
                 word.examples :
                 ['No examples available'],
        usage_contexts: Array.isArray(word.usage_contexts) && word.usage_contexts.length ?
                       word.usage_contexts :
                       ['No context available']
      };
    });
  }

  extractTags(): void {
    // Get unique tags and sort them alphabetically
    const tags = new Set(this.allSavedWords.map(word => word.tag || 'general'));
    this.availableTags = ['all', ...Array.from(tags).sort()];
  }

  filterByTag(): void {
    if (this.selectedTag === 'all') {
      this.filteredWords = [...this.allSavedWords];
    } else {
      this.filteredWords = this.allSavedWords.filter(word =>
        (word.tag || 'general') === this.selectedTag
      );
    }
    // Close any open details when changing filters
    this.selectedWord = null;
  }

  showDetails(word: SavedWord): void {
    this.selectedWord = word;
    // This could be a good place to add analytics or tracking for most viewed words
  }

  closeDetails(): void {
    this.selectedWord = null;
  }

  // Prevent scrolling when modal is open
  onModalOpen(): void {
    document.body.style.overflow = 'hidden';
  }

  onModalClose(): void {
    document.body.style.overflow = 'auto';
  }
}
