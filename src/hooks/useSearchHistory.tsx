import { useState, useEffect, useRef, useMemo } from "react";

// 1. تعريف مظهر بيانات السجل
interface HistoryItem {
  word: string;
  timestamp: number;
}

class TrieNode {
  children: Record<string, TrieNode> = {};
  isEndOfWord: boolean = false;
  timestamp: number = 0;
  originalWord: string = "";
}

class SearchTrie {
  root: TrieNode = new TrieNode();

  insert(word: string, timestamp: number) {
    let node = this.root;
    const lowerWord = word.toLowerCase();
    for (const char of lowerWord) {
      if (!node.children[char]) node.children[char] = new TrieNode();
      node = node.children[char];
    }
    node.isEndOfWord = true;
    node.originalWord = word;
    node.timestamp = Math.max(node.timestamp, timestamp);
  }

  searchPrefix(prefix: string): string[] {
    let node = this.root;
    const lowerPrefix = prefix.toLowerCase();
    for (const char of lowerPrefix) {
      if (!node.children[char]) return [];
      node = node.children[char];
    }
    
    // جلب جميع العقد المستهدفة ثم استخراج الكلمات وترتيبها بشكل صحيح
    const nodesFound = this._getAllNodes(node);
    return nodesFound
      .sort((a, b) => b.timestamp - a.timestamp)
      .map((n) => n.originalWord);
  }

  // دالة مصلحة وآمنة تماماً تجلب العقد (Nodes) لتجنب أي تكرار لانهائي أو انهيار
  private _getAllNodes(node: TrieNode): TrieNode[] {
    let results: TrieNode[] = [];
    if (node.isEndOfWord) {
      results.push(node);
    }
    for (const char in node.children) {
      results.push(...this._getAllNodes(node.children[char]));
    }
    return results;
  }
}

const HISTORY_KEY = "global_search_history_v1";
const MAX_HISTORY_ITEMS = 7;

export function useSearchHistory(keyword: string) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const trieRef = useRef<SearchTrie>(new SearchTrie());

  // تحميل البيانات لأول مرة وتغذية الـ Trie
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      const storedHistory: HistoryItem[] = stored ? JSON.parse(stored) : [];
      setHistory(storedHistory);
      
      // تفريغ الشجرة القديمة وإعادة البناء نظيفة لمنع تكرار المراجع
      trieRef.current = new SearchTrie();
      storedHistory.forEach((item) => trieRef.current.insert(item.word, item.timestamp));
    } catch (e) {
      console.error("فشل في تحميل السجل محلياً", e);
    }
  }, []);

  // دالة الحفظ الموحدة
  const saveToHistory = (searchTerm: string) => {
    const term = searchTerm.trim();
    if (!term) return;

    const newTimestamp = Date.now();
    const updated = history.filter((item) => item.word.toLowerCase() !== term.toLowerCase());
    updated.unshift({ word: term, timestamp: newTimestamp });
    const trimmed = updated.slice(0, MAX_HISTORY_ITEMS);

    setHistory(trimmed);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    trieRef.current.insert(term, newTimestamp);
  };

  // دالة مسح الكل
  const clearAllHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
    trieRef.current = new SearchTrie();
  };

  // دالة مسح عنصر واحد
  const deleteSpecificItem = (termToRemove: string) => {
    const updated = history.filter((item) => item.word !== termToRemove);
    setHistory(updated);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));

    const newTrie = new SearchTrie();
    updated.forEach((item) => newTrie.insert(item.word, item.timestamp));
    trieRef.current = newTrie;
  };

  // جلب الاقتراحات بناءً على الكلمة المكتوبة والـ History المشترك
  const suggestions = useMemo(() => {
    if (!keyword.trim()) {
      return history.slice(0, MAX_HISTORY_ITEMS).map((item) => item.word);
    }
    return trieRef.current.searchPrefix(keyword).slice(0, MAX_HISTORY_ITEMS);
  }, [keyword, history]);

  return { suggestions, saveToHistory, clearAllHistory, deleteSpecificItem };
}