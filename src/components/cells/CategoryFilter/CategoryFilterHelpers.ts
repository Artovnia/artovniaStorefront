/**
 * Helper functions for CategoryFilter component
 */

interface CategoryWithChildren {
  id: string;
  name: string;
  handle?: string;
  parent_category_id?: string | null;
  parent_category?: any;
  mpath?: string;
  category_children?: CategoryWithChildren[];
}

/**
 * Build category tree from flat array using parent_category_id or mpath
 * This is used when categories come from extractCategoriesFromProducts (flat structure)
 */
export function buildCategoryTreeFromFlat(flatCategories: CategoryWithChildren[]): CategoryWithChildren[] {
  // Create a map for quick lookup
  const categoryMap = new Map<string, CategoryWithChildren>();
  
  // Initialize all categories with empty children arrays
  flatCategories.forEach((category: CategoryWithChildren) => {
    categoryMap.set(category.id, {
      ...category,
      category_children: []
    });
  });
  
  const rootCategories: CategoryWithChildren[] = [];
  
  // Build the tree by linking children to parents
  flatCategories.forEach((category: CategoryWithChildren) => {
    const categoryWithChildren = categoryMap.get(category.id)!;
    
    if (!category.parent_category_id) {
      // Root category
      rootCategories.push(categoryWithChildren);
    } else {
      // Child category - add to parent's children
      const parent = categoryMap.get(category.parent_category_id);
      if (parent) {
        if (!parent.category_children) {
          parent.category_children = [];
        }
        parent.category_children.push(categoryWithChildren);
      } else {
        // Parent not found - treat as root
        rootCategories.push(categoryWithChildren);
      }
    }
  });
  
  return rootCategories;
}
