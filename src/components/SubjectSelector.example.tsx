// Example Component: Hierarchical Subject Selector
// This component demonstrates how to use the new subject categories API

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Subject {
  id: number;
  subject_name: string;
  subject_description: string;
  parent_id: number | null;
  parent_name?: string;
  display_order: number;
  children?: Subject[];
}

export function SubjectSelector() {
  const [parentSubjects, setParentSubjects] = useState<Subject[]>([]);
  const [selectedParent, setSelectedParent] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [subcategories, setSubcategories] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Load parent subjects on mount
  useEffect(() => {
    loadParentSubjects();
  }, []);

  // Load subcategories when parent is selected
  useEffect(() => {
    if (selectedParent) {
      loadSubcategories(selectedParent);
    } else {
      setSubcategories([]);
    }
  }, [selectedParent]);

  const loadParentSubjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/subjects/parents');
      setParentSubjects(response.data);
    } catch (error) {
      console.error('Failed to load subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubcategories = async (parentId: number) => {
    try {
      const response = await api.get(`/subjects/parent/${parentId}/children`);
      setSubcategories(response.data.children || []);
    } catch (error) {
      console.error('Failed to load subcategories:', error);
      setSubcategories([]);
    }
  };

  const handleParentChange = (parentId: string) => {
    const id = parentId ? parseInt(parentId) : null;
    setSelectedParent(id);
    setSelectedSubject(null); // Reset subcategory selection
  };

  const handleSubjectChange = (subjectId: string) => {
    const id = subjectId ? parseInt(subjectId) : null;
    setSelectedSubject(id);
  };

  if (loading) {
    return <div>Loading subjects...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Parent Subject Selector */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Select Exam Category
        </label>
        <select
          className="w-full p-2 border rounded-md"
          value={selectedParent || ''}
          onChange={(e) => handleParentChange(e.target.value)}
        >
          <option value="">-- Select a category --</option>
          {parentSubjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.subject_name}
            </option>
          ))}
        </select>
        {selectedParent && parentSubjects.find(s => s.id === selectedParent)?.subject_description && (
          <p className="text-sm text-gray-600 mt-1">
            {parentSubjects.find(s => s.id === selectedParent)?.subject_description}
          </p>
        )}
      </div>

      {/* Subcategory Selector (only shown if parent has subcategories) */}
      {selectedParent && subcategories.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Select Subcategory
          </label>
          <select
            className="w-full p-2 border rounded-md"
            value={selectedSubject || ''}
            onChange={(e) => handleSubjectChange(e.target.value)}
          >
            <option value="">-- Select a subcategory --</option>
            {subcategories.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.subject_name}
              </option>
            ))}
          </select>
          {selectedSubject && subcategories.find(s => s.id === selectedSubject)?.subject_description && (
            <p className="text-sm text-gray-600 mt-1">
              {subcategories.find(s => s.id === selectedSubject)?.subject_description}
            </p>
          )}
        </div>
      )}

      {/* Display Selection Summary */}
      {(selectedParent || selectedSubject) && (
        <div className="p-4 bg-blue-50 rounded-md">
          <h3 className="font-medium mb-2">Selected:</h3>
          <p className="text-sm">
            <strong>Category:</strong> {parentSubjects.find(s => s.id === selectedParent)?.subject_name || 'None'}
          </p>
          {selectedSubject && subcategories.length > 0 && (
            <p className="text-sm mt-1">
              <strong>Subcategory:</strong> {subcategories.find(s => s.id === selectedSubject)?.subject_name || 'None'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// Alternative: Flat List with Visual Hierarchy
// ============================================

export function FlatSubjectList() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllSubjects();
  }, []);

  const loadAllSubjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/subjects?includeHierarchy=true');
      setSubjects(response.data);
    } catch (error) {
      console.error('Failed to load subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading subjects...</div>;
  }

  return (
    <div className="space-y-2">
      {subjects.map((subject) => (
        <div
          key={subject.id}
          className={`p-3 border rounded-md hover:bg-gray-50 cursor-pointer ${
            subject.parent_id ? 'ml-6 border-l-4 border-blue-400' : 'font-medium'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm">
                {subject.parent_name && (
                  <span className="text-gray-500">{subject.parent_name} → </span>
                )}
                {subject.subject_name}
              </span>
              {subject.subject_description && (
                <p className="text-xs text-gray-600 mt-1">{subject.subject_description}</p>
              )}
            </div>
            {!subject.parent_id && (
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                Main
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// Alternative: Grouped List View
// ============================================

export function GroupedSubjectList() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadParentsWithChildren();
  }, []);

  const loadParentsWithChildren = async () => {
    try {
      setLoading(true);
      // Get parent subjects
      const response = await api.get('/subjects/parents');
      const parents = response.data;

      // Load children for each parent
      const enrichedParents = await Promise.all(
        parents.map(async (parent: Subject) => {
          const childrenResponse = await api.get(`/subjects/parent/${parent.id}/children`);
          return {
            ...parent,
            children: childrenResponse.data.children || []
          };
        })
      );

      setSubjects(enrichedParents);
    } catch (error) {
      console.error('Failed to load subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading subjects...</div>;
  }

  return (
    <div className="space-y-6">
      {subjects.map((parent) => (
        <div key={parent.id} className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">{parent.subject_name}</h3>
          {parent.subject_description && (
            <p className="text-sm text-gray-600 mb-3">{parent.subject_description}</p>
          )}

          {parent.children && parent.children.length > 0 ? (
            <div className="ml-4 space-y-2">
              {parent.children.map((child) => (
                <div
                  key={child.id}
                  className="p-2 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
                >
                  <p className="text-sm font-medium">{child.subject_name}</p>
                  {child.subject_description && (
                    <p className="text-xs text-gray-600 mt-1">{child.subject_description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic ml-4">No subcategories</p>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================
// Usage Examples
// ============================================

/*
// In your exam selection page:
import { SubjectSelector } from './SubjectSelector';

function ExamPage() {
  return (
    <div>
      <h1>Select Your Exam</h1>
      <SubjectSelector />
    </div>
  );
}

// In your admin dashboard:
import { GroupedSubjectList } from './SubjectSelector';

function AdminSubjects() {
  return (
    <div>
      <h1>Manage Subjects</h1>
      <GroupedSubjectList />
    </div>
  );
}
*/
