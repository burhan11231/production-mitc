'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

interface Post {
  id: string;
  url: string;
  caption?: string;
  addedAt: any;
}

export default function InstagramPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [newPost, setNewPost] = useState({ url: '', caption: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'add' | 'list'>('add');

  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      toast.error('Admin access required');
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchPosts();
    }
  }, [user]);

  const fetchPosts = async () => {
    try {
      const q = query(collection(db, 'instagramPosts'), orderBy('addedAt', 'desc'));
      const snap = await getDocs(q);
      const postsData = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
      setPosts(postsData);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setPostsLoading(false);
    }
  };

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.url.trim()) {
      toast.error('Please enter an Instagram embed URL');
      return;
    }

    setIsSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, 'instagramPosts'), {
        url: newPost.url,
        caption: newPost.caption || '',
        addedAt: serverTimestamp(),
      });

      setPosts((prev) => [
        {
          id: docRef.id,
          url: newPost.url,
          caption: newPost.caption || '',
          addedAt: new Date(),
        },
        ...prev,
      ]);

      setNewPost({ url: '', caption: '' });
      setActiveTab('list');
      toast.success('Post added successfully!');
    } catch (error) {
      console.error('Error adding post:', error);
      toast.error('Failed to add post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Delete this post?')) return;

    try {
      await deleteDoc(doc(db, 'instagramPosts', postId));
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="text-primary-600 hover:text-primary-700 text-sm mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Instagram Gallery</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('add')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'add'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Add New Post
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'list'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            All Posts ({posts.length})
          </button>
        </div>

        {/* Add Post Tab */}
        {activeTab === 'add' && (
          <div className="card p-8 max-w-2xl">
            <form onSubmit={handleAddPost} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instagram Embed URL *
                </label>
                <textarea
                  value={newPost.url}
                  onChange={(e) => setNewPost({ ...newPost, url: e.target.value })}
                  placeholder="Paste Instagram embed URL here (e.g., https://www.instagram.com/p/ABC123/)"
                  rows={4}
                  className="input-field resize-none"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  📄 How to get embed URL: Go to Instagram post → Click menu (•••) → Copy link
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Caption (Optional)</label>
                <textarea
                  value={newPost.caption}
                  onChange={(e) => setNewPost({ ...newPost, caption: e.target.value })}
                  placeholder="Add a caption for this post"
                  rows={3}
                  className="input-field resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full"
              >
                {isSubmitting ? 'Adding...' : 'Add Post'}
              </button>
            </form>
          </div>
        )}

        {/* Posts List Tab */}
        {activeTab === 'list' && (
          postsLoading ? (
            <div className="flex justify-center py-12">
              <div className="spinner" />
            </div>
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {posts.map((post) => (
                <div key={post.id} className="card p-6">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-gray-600 text-sm mb-2">Instagram Post Preview</p>
                      <p className="text-xs text-gray-500 break-all">{post.url}</p>
                    </div>
                  </div>
                  {post.caption && (
                    <p className="text-gray-700 mb-4 line-clamp-2">{post.caption}</p>
                  )}
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                      {new Date(post.addedAt?.toDate?.() || post.addedAt).toLocaleDateString()}
                    </p>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="text-red-600 hover:text-red-700 font-medium text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <p className="text-gray-600 text-lg">No posts yet</p>
              <p className="text-gray-500 mb-6">Start by adding your first Instagram post</p>
              <button
                onClick={() => setActiveTab('add')}
                className="btn-primary"
              >
                Add First Post
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
