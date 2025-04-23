import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../components/ui';
import { Tab } from '@headlessui/react';
import axios from 'axios';

interface MealPlan {
  breakfast: Array<{
    name: string;
    description: string;
    nutrients: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
  }>;
  lunch: Array<{
    name: string;
    description: string;
    nutrients: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
  }>;
  dinner: Array<{
    name: string;
    description: string;
    nutrients: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
  }>;
  snacks: Array<{
    name: string;
    description: string;
    nutrients: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
  }>;
}

interface NutritionalGoal {
  name: string;
  current: number;
  target: number;
  unit: string;
}

const Diet: React.FC = () => {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  
  const nutritionalGoals: NutritionalGoal[] = [
    { name: 'Calories', current: 2200, target: 2000, unit: 'kcal' },
    { name: 'Protein', current: 85, target: 100, unit: 'g' },
    { name: 'Carbs', current: 240, target: 225, unit: 'g' },
    { name: 'Fat', current: 65, target: 55, unit: 'g' },
    { name: 'Fiber', current: 18, target: 25, unit: 'g' },
    { name: 'Sodium', current: 2400, target: 2300, unit: 'mg' },
  ];

  useEffect(() => {
    const fetchMealPlan = async () => {
      try {
        // Using a demo run_id for now - in a real app this would come from user context
        const response = await axios.get(`/api/v1/diet/meal-plan?run_id=demo123&preferences=balanced`);
        setMealPlan(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch meal plan:', err);
        setError('Failed to load your meal plan. Please try again later.');
        setLoading(false);
      }
    };

    fetchMealPlan();
  }, []);

  // Function to render a meal item
  const renderMealItem = (meal: any) => {
    return (
      <Card key={meal.name} className="mb-4">
        <div className="p-4">
          <h3 className="text-lg font-medium mb-2">{meal.name}</h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-3">
            {meal.description}
          </p>
          <div className="flex flex-wrap gap-3">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {meal.nutrients.calories} cal
            </span>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              {meal.nutrients.protein}g protein
            </span>
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              {meal.nutrients.carbs}g carbs
            </span>
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
              {meal.nutrients.fat}g fat
            </span>
          </div>
        </div>
      </Card>
    );
  };

  // Function to render a nutritional goal
  const renderNutritionalGoal = (goal: NutritionalGoal) => {
    const percentage = Math.min(100, Math.round((goal.current / goal.target) * 100));
    const isExceeding = goal.current > goal.target;
    const barColor = isExceeding ? 'bg-red-500' : 'bg-green-500';
    
    return (
      <div key={goal.name} className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">{goal.name}</span>
          <span className="text-sm text-neutral-600">
            {goal.current} / {goal.target} {goal.unit}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${barColor}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  // Function to render nutritionists
  const renderNutritionists = () => {
    const nutritionists = [
      {
        name: 'Dr. Emily Chen',
        specialty: 'Clinical Nutrition',
        image: 'https://randomuser.me/api/portraits/women/44.jpg',
        availability: 'Available next Tuesday'
      },
      {
        name: 'Michael Torres, RD',
        specialty: 'Sports Nutrition',
        image: 'https://randomuser.me/api/portraits/men/32.jpg',
        availability: 'Available tomorrow'
      },
      {
        name: 'Sarah Johnson, RDN',
        specialty: 'Diabetes Management',
        image: 'https://randomuser.me/api/portraits/women/68.jpg',
        availability: 'Available next Monday'
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {nutritionists.map(nutritionist => (
          <Card key={nutritionist.name}>
            <div className="p-4 flex flex-col h-full">
              <div className="flex items-center mb-4">
                <img 
                  src={nutritionist.image} 
                  alt={nutritionist.name} 
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h3 className="font-medium">{nutritionist.name}</h3>
                  <p className="text-sm text-neutral-600">{nutritionist.specialty}</p>
                </div>
              </div>
              <p className="text-sm text-neutral-600 mb-4">{nutritionist.availability}</p>
              <button className="mt-auto w-full bg-brand-purple text-white py-2 px-4 rounded hover:bg-brand-purple-dark transition-colors">
                Schedule Consultation
              </button>
            </div>
          </Card>
        ))}
      </div>
    );
  };

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
      <h1 className="text-2xl font-bold mb-6">Diet & Nutrition</h1>
      <p className="text-lg text-neutral-600 mb-8">
        Personalized nutrition recommendations based on your health profile
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
              Daily Meal Plan
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
              Nutritional Goals
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
              Find Nutritionists
            </Tab>
          </Tab.List>
          
          <Tab.Panels className="mt-6">
            <Tab.Panel>
              {mealPlan && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Breakfast</h2>
                  {mealPlan.breakfast.map(meal => renderMealItem(meal))}
                  
                  <h2 className="text-xl font-semibold mb-4 mt-8">Lunch</h2>
                  {mealPlan.lunch.map(meal => renderMealItem(meal))}
                  
                  <h2 className="text-xl font-semibold mb-4 mt-8">Dinner</h2>
                  {mealPlan.dinner.map(meal => renderMealItem(meal))}
                  
                  <h2 className="text-xl font-semibold mb-4 mt-8">Snacks</h2>
                  {mealPlan.snacks.map(meal => renderMealItem(meal))}
                </div>
              )}
            </Tab.Panel>
            
            <Tab.Panel>
              <Card>
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-4">Your Daily Targets</h2>
                  <div className="space-y-2">
                    {nutritionalGoals.map(goal => renderNutritionalGoal(goal))}
                  </div>
                </div>
              </Card>
            </Tab.Panel>
            
            <Tab.Panel>
              <div>
                <h2 className="text-xl font-semibold mb-4">Nutritionists Available for Consultation</h2>
                {renderNutritionists()}
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
      
      <section>
        <h2 className="text-xl font-semibold mb-4">Your Health Context</h2>
        <Card>
          <div className="p-4">
            <h3 className="font-medium mb-2">Recommendations based on your recent lab results from March 15, 2023:</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Increase daily intake of Vitamin D to address deficiency</li>
              <li>Reduce saturated fat consumption to help lower elevated LDL cholesterol</li>
              <li>Consider adding more fiber-rich foods to support digestive health</li>
              <li>Include more omega-3 sources to improve heart health markers</li>
            </ul>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default Diet; 