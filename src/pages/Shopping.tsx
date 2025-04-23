import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui';
import { Tab } from '@headlessui/react';
import axios from 'axios';

interface GroceryItem {
  id: string;
  name: string;
  category: string;
  nutritionalBenefits: string[];
  healthReason: string;
  image?: string;
}

interface GroceryCategory {
  name: string;
  items: GroceryItem[];
}

const Shopping: React.FC = () => {
  const [groceries, setGroceries] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchGroceries = async () => {
      try {
        // Using a demo run_id for now - in a real app this would come from user context
        const response = await axios.get(`/api/v1/shopping/grocery-recommendations?run_id=demo123&location=San Francisco`);
        setGroceries(response.data.items);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch grocery recommendations:', err);
        setError('Failed to load grocery recommendations. Please try again later.');
        setLoading(false);
      }
    };

    fetchGroceries();
  }, []);

  // Group groceries by category - not used in this implementation but kept for future reference
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const groupGroceriesByCategory = (items: GroceryItem[]): GroceryCategory[] => {
    if (!items.length) return [];

    const categories: Record<string, GroceryItem[]> = {};
    
    items.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = [];
      }
      categories[item.category].push(item);
    });

    return Object.keys(categories).map(category => ({
      name: category,
      items: categories[category]
    }));
  };

  // Mock grocery data
  const mockVitaminDFoods = [
    { id: 'fish1', name: 'Fatty Fish (Salmon, Mackerel, Tuna)', description: 'Excellent source of vitamin D to address deficiency' },
    { id: 'eggs1', name: 'Egg Yolks', description: 'Contains vitamin D and heart-healthy nutrients' },
    { id: 'milk1', name: 'Fortified Milk or Plant Milk', description: 'Good dietary source of vitamin D' },
    { id: 'mush1', name: 'Mushrooms (especially sun-exposed)', description: 'One of the few plant sources of vitamin D' },
  ];

  const mockCholesterolFoods = [
    { id: 'oats1', name: 'Oats and Barley', description: 'Contain beta-glucans that help lower LDL cholesterol' },
    { id: 'beans1', name: 'Beans and Legumes', description: 'Rich in soluble fiber that helps reduce cholesterol absorption' },
    { id: 'avoc1', name: 'Avocados', description: 'Rich in monounsaturated fats that help lower LDL cholesterol' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Shopping & Meal Services</h1>
      <p className="text-lg text-neutral-600 mb-8">
        Personalized grocery recommendations and meal delivery options
      </p>

      <div className="mb-8">
        <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
          <Tab.List className="flex space-x-1 border-b border-neutral-200">
            <Tab 
              className={({ selected }: { selected: boolean }) =>
                `py-3 px-6 text-sm font-medium border-b-2 focus:outline-none ${
                  selected
                    ? 'text-brand-purple border-brand-purple'
                    : 'text-neutral-600 border-transparent hover:text-neutral-900 hover:border-neutral-300'
                }`
              }
            >
              Grocery List
            </Tab>
            <Tab 
              className={({ selected }: { selected: boolean }) =>
                `py-3 px-6 text-sm font-medium border-b-2 focus:outline-none ${
                  selected
                    ? 'text-brand-purple border-brand-purple'
                    : 'text-neutral-600 border-transparent hover:text-neutral-900 hover:border-neutral-300'
                }`
              }
            >
              Meal Delivery
            </Tab>
            <Tab 
              className={({ selected }: { selected: boolean }) =>
                `py-3 px-6 text-sm font-medium border-b-2 focus:outline-none ${
                  selected
                    ? 'text-brand-purple border-brand-purple'
                    : 'text-neutral-600 border-transparent hover:text-neutral-900 hover:border-neutral-300'
                }`
              }
            >
              Local Health Stores
            </Tab>
          </Tab.List>
          
          <Tab.Panels className="mt-6">
            <Tab.Panel>
              <div>
                <h2 className="text-2xl font-bold mb-6">Personalized Grocery Recommendations</h2>
                <p className="mb-8">Based on your health profile and recent lab results, these foods can help improve your nutrition.</p>
                
                <div className="mb-10">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                      <span className="text-purple-600">D</span>
                    </div>
                    <h3 className="text-xl font-semibold">Vitamin D Rich Foods</h3>
                  </div>
                  
                  {mockVitaminDFoods.map(food => (
                    <div key={food.id} className="flex items-center py-3 border-b border-gray-100">
                      <input 
                        type="checkbox"
                        className="h-5 w-5 text-brand-purple rounded border-gray-300 focus:ring-brand-purple mr-3"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{food.name}</p>
                        <p className="text-sm text-gray-600">{food.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mb-10">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                      <span className="text-red-600">❤</span>
                    </div>
                    <h3 className="text-xl font-semibold">Cholesterol-Lowering Foods</h3>
                  </div>
                  
                  {mockCholesterolFoods.map(food => (
                    <div key={food.id} className="flex items-center py-3 border-b border-gray-100">
                      <input 
                        type="checkbox"
                        className="h-5 w-5 text-brand-purple rounded border-gray-300 focus:ring-brand-purple mr-3"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{food.name}</p>
                        <p className="text-sm text-gray-600">{food.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between">
                  <button className="border border-brand-purple text-brand-purple px-4 py-2 rounded hover:bg-brand-purple hover:text-white transition-colors">
                    Add Selected to Shopping List
                  </button>
                  <button className="bg-brand-purple text-white px-4 py-2 rounded hover:bg-brand-purple-dark transition-colors">
                    View My Shopping List
                  </button>
                </div>
              </div>
            </Tab.Panel>
            
            <Tab.Panel>
              <div>
                <h2 className="text-2xl font-bold mb-6">Meal Delivery Services</h2>
                <p className="mb-8">Healthy meal plans delivered to your door, customized for your nutritional needs.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      name: "Green Chef",
                      image: "https://via.placeholder.com/100",
                      description: "Organic ingredients with plans for different diets including keto, paleo, and plant-based.",
                      price: "$9.99/meal"
                    },
                    {
                      name: "Hello Fresh",
                      image: "https://via.placeholder.com/100",
                      description: "Wide variety of meals with options for low-calorie, vegetarian, and family-friendly recipes.",
                      price: "$8.99/meal"
                    },
                    {
                      name: "Sun Basket",
                      image: "https://via.placeholder.com/100",
                      description: "Organic produce and clean ingredients with diabetes-friendly and heart-healthy options.",
                      price: "$10.99/meal"
                    }
                  ].map(service => (
                    <Card key={service.name}>
                      <div className="p-4">
                        <div className="flex items-center mb-4">
                          <img src={service.image} alt={service.name} className="w-12 h-12 rounded-full mr-3" />
                          <h3 className="font-semibold text-lg">{service.name}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                        <div className="flex justify-between items-center mt-4">
                          <span className="font-bold">{service.price}</span>
                          <button className="bg-brand-purple text-white px-3 py-1 rounded text-sm hover:bg-brand-purple-dark transition-colors">
                            View Plans
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </Tab.Panel>
            
            <Tab.Panel>
              <div>
                <h2 className="text-2xl font-bold mb-6">Local Health Food Stores</h2>
                <p className="mb-8">Find specialty health food stores near you that carry recommended products.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      name: "Whole Foods Market",
                      address: "399 4th Street, San Francisco, CA",
                      distance: "1.2 miles",
                      hours: "8am - 10pm daily"
                    },
                    {
                      name: "Sprouts Farmers Market",
                      address: "301 Gellert Blvd, Daly City, CA",
                      distance: "3.5 miles",
                      hours: "7am - 10pm daily"
                    },
                    {
                      name: "Rainbow Grocery Cooperative",
                      address: "1745 Folsom St, San Francisco, CA",
                      distance: "2.1 miles",
                      hours: "9am - 9pm daily"
                    },
                    {
                      name: "Gus's Community Market",
                      address: "2111 Harrison St, San Francisco, CA",
                      distance: "1.8 miles",
                      hours: "7am - 10pm daily"
                    }
                  ].map(store => (
                    <Card key={store.name}>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{store.name}</h3>
                        <p className="text-sm text-gray-600">{store.address}</p>
                        <div className="flex justify-between mt-3 text-sm">
                          <span>{store.distance}</span>
                          <span>{store.hours}</span>
                        </div>
                        <div className="mt-4 flex space-x-2">
                          <button className="flex-1 bg-brand-purple text-white py-1 rounded text-sm hover:bg-brand-purple-dark transition-colors">
                            Directions
                          </button>
                          <button className="flex-1 border border-brand-purple text-brand-purple py-1 rounded text-sm hover:bg-brand-purple-50 transition-colors">
                            Call Store
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default Shopping; 