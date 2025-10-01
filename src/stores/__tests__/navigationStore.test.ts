import { renderHook, act } from '@testing-library/react';
import { useNavigationStore } from '../navigationStore';

describe('NavigationStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useNavigationStore());
    act(() => {
      result.current.setActiveRoute('/dashboard');
      result.current.clearSearch();
    });
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useNavigationStore());

    expect(result.current.activeRoute).toBe('/dashboard');
    expect(result.current.searchQuery).toBe('');
    expect(result.current.isSearching).toBe(false);
    expect(result.current.searchResults).toEqual([]);
  });

  it('updates active route', () => {
    const { result } = renderHook(() => useNavigationStore());

    act(() => {
      result.current.setActiveRoute('/dashboard/alumni');
    });

    expect(result.current.activeRoute).toBe('/dashboard/alumni');
  });

  it('updates search query', () => {
    const { result } = renderHook(() => useNavigationStore());

    act(() => {
      result.current.setSearchQuery('test query');
    });

    expect(result.current.searchQuery).toBe('test query');
  });

  it('updates searching state', () => {
    const { result } = renderHook(() => useNavigationStore());

    act(() => {
      result.current.setIsSearching(true);
    });

    expect(result.current.isSearching).toBe(true);
  });

  it('updates search results', () => {
    const { result } = renderHook(() => useNavigationStore());
    const mockResults = [
      {
        id: '1',
        type: 'alumni',
        title: 'John Doe',
        description: 'Test',
        url: '/test',
      },
    ];

    act(() => {
      result.current.setSearchResults(mockResults);
    });

    expect(result.current.searchResults).toEqual(mockResults);
  });

  it('clears search state', () => {
    const { result } = renderHook(() => useNavigationStore());

    // Set some search state
    act(() => {
      result.current.setSearchQuery('test');
      result.current.setIsSearching(true);
      result.current.setSearchResults([
        {
          id: '1',
          type: 'test',
          title: 'Test',
          description: 'Test',
          url: '/test',
        },
      ]);
    });

    // Clear search
    act(() => {
      result.current.clearSearch();
    });

    expect(result.current.searchQuery).toBe('');
    expect(result.current.isSearching).toBe(false);
    expect(result.current.searchResults).toEqual([]);
  });
});
