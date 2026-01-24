import { HttpTypes } from "@medusajs/types";

// Helper function to generate UUIDs for IDs
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

// Create grandchildren categories (level 3)
const createGrandchildren = (parentName: string, count: number = 10): HttpTypes.StoreProductCategory[] => {
  return Array.from({ length: count }, (_, index) => {
    const id = generateId();
    const name = `${parentName} Podkategoria ${index + 1}`;
    const handle = name.toLowerCase().replace(/\s+/g, '-');
    
    return {
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      name,
      handle,
      description: `Subcategory of ${parentName}`,
      deleted_at: null,
      parent_category_id: parentName, // This would be the actual ID in real data
      parent_category: null, // Will be populated in the processing step
      category_children: [],
      rank: index,
      metadata: {}
    };
  });
};

// Create children categories (level 2)
const createChildren = (parentName: string, count: number = 8): HttpTypes.StoreProductCategory[] => {
  return Array.from({ length: count }, (_, index) => {
    const id = generateId();
    const name = `${parentName} ${index + 1}`;
    const handle = name.toLowerCase().replace(/\s+/g, '-');
    const grandchildren = createGrandchildren(name, 10);
    
    return {
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      name,
      handle,
      description: `Category ${index + 1} of ${parentName}`,
      deleted_at: null,
      parent_category_id: parentName, // This would be the actual ID in real data
      parent_category: null, // Will be populated in the processing step
      category_children: grandchildren,
      rank: index,
      metadata: {}
    };
  });
};

// Create parent categories (level 1)
export const mockCategoryData: HttpTypes.StoreProductCategory[] = [
  // Ona (Women)
  {
    id: "ona",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    name: "Ona",
    handle: "ona",
    description: "Kolekcja dla kobiet",
    deleted_at: null,
    parent_category_id: null,
    parent_category: null,
    category_children: createChildren("Ona", 8),
    rank: 0,
    metadata: {}
  },
  
  // On (Men)
  {
    id: "on",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    name: "On",
    handle: "on",
    description: "Kolekcja dla mężczyzn",
    deleted_at: null,
    parent_category_id: null,
    parent_category: null,
    category_children: createChildren("On", 8),
    rank: 1,
    metadata: {}
  },
  
  // Dom (Home)
  {
    id: "dom",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    name: "Dom",
    handle: "dom",
    description: "Artykuły do domu",
    deleted_at: null,
    parent_category_id: null,
    parent_category: null,
    category_children: createChildren("Dom", 8),
    rank: 2,
    metadata: {}
  },
  
  // Biżuteria (Jewelry)
  {
    id: "bizuteria",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    name: "Biżuteria",
    handle: "bizuteria",
    description: "Biżuteria artystyczna",
    deleted_at: null,
    parent_category_id: null,
    parent_category: null,
    category_children: createChildren("Biżuteria", 8),
    rank: 3,
    metadata: {}
  },
  
  // Sztuka (Art)
  {
    id: "sztuka",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    name: "Sztuka",
    handle: "sztuka",
    description: "Sztuka współczesna",
    deleted_at: null,
    parent_category_id: null,
    parent_category: null,
    category_children: createChildren("Sztuka", 8),
    rank: 4,
    metadata: {}
  },
  
  // Akcesoria (Accessories)
  {
    id: "akcesoria",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    name: "Akcesoria",
    handle: "akcesoria",
    description: "Akcesoria modowe",
    deleted_at: null,
    parent_category_id: null,
    parent_category: null,
    category_children: createChildren("Akcesoria", 8),
    rank: 5,
    metadata: {}
  }
];

// Process the mock data to create a flattened version with proper parent references
export const processMockCategoryData = (): HttpTypes.StoreProductCategory[] => {
  const flattenedCategories: HttpTypes.StoreProductCategory[] = [];
  
  // Add parent categories
  mockCategoryData.forEach(parent => {
    // Clone the parent without children
    const parentClone = { ...parent, category_children: [] };
    flattenedCategories.push(parentClone);
    
    // Add children with proper parent reference
    parent.category_children.forEach(child => {
      const childClone = { 
        ...child, 
        parent_category_id: parent.id,
        parent_category: parentClone,
        category_children: []
      };
      flattenedCategories.push(childClone);
      
      // Add grandchildren with proper parent reference
      child.category_children.forEach(grandchild => {
        const grandchildClone = {
          ...grandchild,
          parent_category_id: child.id,
          parent_category: childClone,
          category_children: []
        };
        flattenedCategories.push(grandchildClone);
      });
    });
  });
  
  return flattenedCategories;
};

// Export both nested and flattened versions
export const mockCategoriesFlat = processMockCategoryData();

// Function to retrieve only top-level categories with their hierarchy intact
export const getTopLevelCategories = (): HttpTypes.StoreProductCategory[] => {

  return mockCategoryData;
};
