import React, { useState } from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import mockGroceries from '../../data/mockGroceries.json';

// Define TypeScript interfaces for our data
interface GroceryItem {
  id: string;
  category: string;
  name: string;
  items: string[];
  benefits: string[];
  reason: string;
  priority: string;
  preparation_tips: string;
}

const GroceryRecommendations: React.FC = () => {
  // Group groceries by category
  const groceriesByCategory = mockGroceries.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, GroceryItem[]>);

  // Get unique categories
  const categories = Object.keys(groceriesByCategory);

  // State for the selected category
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [expandedItems, setExpandedItems] = useState<Record<string, string>>({});

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  const toggleExpanded = (itemId: string, section: string) => {
    setExpandedItems(prev => {
      // If already expanded for this section, close it
      if (prev[itemId] === section) {
        const newState = {...prev};
        delete newState[itemId];
        return newState;
      }
      // Otherwise set it to this section
      return {...prev, [itemId]: section};
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Personalized Grocery Recommendations</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Based on your health data, we've created personalized food recommendations to help address specific health concerns and optimize your nutrition.
        </p>
        
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map(category => (
            <Button
              key={category}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? 'primary' : 'secondary'}
              className="capitalize"
            >
              {category}
            </Button>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groceriesByCategory[selectedCategory]?.map(item => (
            <Card key={item.id} className="overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold">{item.name}</h3>
                  <Badge className={getPriorityColor(item.priority)}>
                    {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} Priority
                  </Badge>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4">{item.reason}</p>
                
                <div className="space-y-3">
                  {/* Recommended Foods */}
                  <div>
                    <button 
                      onClick={() => toggleExpanded(item.id, 'foods')}
                      className="flex justify-between w-full py-2 text-left font-medium text-gray-900 dark:text-white"
                    >
                      <span>Recommended Foods</span>
                      <span>{expandedItems[item.id] === 'foods' ? '−' : '+'}</span>
                    </button>
                    
                    {expandedItems[item.id] === 'foods' && (
                      <ul className="list-disc pl-5 mt-2 mb-3">
                        {item.items.map((food, index) => (
                          <li key={index} className="text-gray-600 dark:text-gray-300">
                            {food}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  
                  {/* Health Benefits */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <button 
                      onClick={() => toggleExpanded(item.id, 'benefits')}
                      className="flex justify-between w-full py-2 text-left font-medium text-gray-900 dark:text-white"
                    >
                      <span>Health Benefits</span>
                      <span>{expandedItems[item.id] === 'benefits' ? '−' : '+'}</span>
                    </button>
                    
                    {expandedItems[item.id] === 'benefits' && (
                      <ul className="list-disc pl-5 mt-2 mb-3">
                        {item.benefits.map((benefit, index) => (
                          <li key={index} className="text-gray-600 dark:text-gray-300">
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  
                  {/* Preparation Tips */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <button 
                      onClick={() => toggleExpanded(item.id, 'tips')}
                      className="flex justify-between w-full py-2 text-left font-medium text-gray-900 dark:text-white"
                    >
                      <span>Preparation Tips</span>
                      <span>{expandedItems[item.id] === 'tips' ? '−' : '+'}</span>
                    </button>
                    
                    {expandedItems[item.id] === 'tips' && (
                      <p className="text-gray-600 dark:text-gray-300 mt-2">
                        {item.preparation_tips}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GroceryRecommendations; 