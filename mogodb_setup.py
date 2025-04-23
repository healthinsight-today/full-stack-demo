from pymongo import MongoClient, ASCENDING, DESCENDING
from bson import ObjectId
import datetime

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')

# Create or get the database
db = client['healthinsighttoday']

# Drop existing collections to start fresh
for collection in db.list_collection_names():
    db[collection].drop()

# Create collections with schema validation
print("Creating Collections for Health Insight Today...\n")

# 1. Reports Collection
db.create_collection('reports')
reports = db['reports']

# 2. Insights Collection
db.create_collection('insights')
insights = db['insights']

# 3. Recommendations Collection
db.create_collection('recommendations')
recommendations = db['recommendations']

# 4. Parameter History Collection
db.create_collection('parameter_history')
parameter_history = db['parameter_history']

# 5. Educational Content Collection
db.create_collection('educational_content')
educational_content = db['educational_content']

# 6. User Preferences Collection
db.create_collection('user_preferences')
user_preferences = db['user_preferences']

# 7. Users Collection
db.create_collection('users')
users = db['users']

# 8. Subscriptions Collection
db.create_collection('subscriptions')
subscriptions = db['subscriptions']

# 9. Payments Collection
db.create_collection('payments')
payments = db['payments']

# 10. Analytics Collection
db.create_collection('analytics')
analytics = db['analytics']

# Create indexes for all collections
print("Creating indexes for optimal performance...\n")

# Reports indexes
reports.create_index([("user_id", ASCENDING), ("report_date", DESCENDING)])
reports.create_index([("report_id", ASCENDING)])
reports.create_index([("patient_info.name", ASCENDING)])
reports.create_index([("abnormal_parameters.name", ASCENDING)])
reports.create_index([("created_at", DESCENDING)])

# Insights indexes
insights.create_index([("report_id", ASCENDING)])
insights.create_index([("user_id", ASCENDING)])
insights.create_index([("conditions.name", ASCENDING)])
insights.create_index([("conditions.related_body_systems", ASCENDING)])

# Recommendations indexes
recommendations.create_index([("report_id", ASCENDING)])
recommendations.create_index([("user_id", ASCENDING)])
recommendations.create_index([("medical_recommendations.urgency", ASCENDING)])
recommendations.create_index([("medical_recommendations.specialist_type", ASCENDING)])

# Parameter history indexes
parameter_history.create_index([("user_id", ASCENDING), ("parameter_name", ASCENDING)])
parameter_history.create_index([("values.report_date", DESCENDING)])

# Educational content indexes
educational_content.create_index([("parameter_name", ASCENDING)])
educational_content.create_index([("content.tags", ASCENDING)])

# User preferences indexes
user_preferences.create_index([("user_id", ASCENDING)])

# Users indexes
users.create_index([("email", ASCENDING)], unique=True)

# Subscriptions indexes
subscriptions.create_index([("user_id", ASCENDING)])
subscriptions.create_index([("status", ASCENDING)])
subscriptions.create_index([("expiration_date", ASCENDING)])

# Payments indexes
payments.create_index([("user_id", ASCENDING)])
payments.create_index([("subscription_id", ASCENDING)])
payments.create_index([("payment_date", DESCENDING)])

# Analytics indexes
analytics.create_index([("date", DESCENDING)])
analytics.create_index([("event_type", ASCENDING)])

# Sample user document
user_id = ObjectId()
user_doc = {
    "_id": user_id,
    "name": "SRIDHAR",
    "email": "sridhar@example.com",
    "subscription_tier": "premium",
    "created_at": datetime.datetime.now(),
    "last_login": datetime.datetime.now(),
    "registration_source": "organic",  # "organic", "referral", "social"
    "referrer_id": None,
    "status": "active",  # "active", "inactive", "suspended"
    "email_verified": True,
    "registration_date": datetime.datetime.now() - datetime.timedelta(days=60),
    "last_activity": datetime.datetime.now(),
    "feature_usage": {
        "reports_uploaded": 5,
        "recommendations_viewed": 12,
        "diet_plans_generated": 3
    }
}
users.insert_one(user_doc)

# Insert a sample report document
report_id = ObjectId()
report_doc = {
    "_id": report_id,
    "user_id": user_id,
    "report_id": "MB1409855",
    "report_type": "COMPREHENSIVE FULL BODY CHECKUP WITH VITAMIN D & B12",
    "report_date": datetime.datetime(2025, 1, 21),
    "lab_name": "MediBuddy",
    "patient_info": {
        "name": "Mr. SRIDHAR",
        "age": 37,
        "gender": "Male",
        "id": "0012501220095"
    },
    "test_sections": [
        {
            "section_name": "LIPID PROFILE",
            "category": "Clinical Biochemistry",
            "parameters": [
                {
                    "name": "Cholesterol Total",
                    "value": 201,
                    "unit": "mg/dL",
                    "reference_range": "≤200",
                    "is_abnormal": True,
                    "direction": "high",
                    "section_index": 0,
                    "parameter_index": 0
                },
                {
                    "name": "Cholesterol-LDL",
                    "value": 134,
                    "unit": "mg/dL",
                    "reference_range": "≤100",
                    "is_abnormal": True,
                    "direction": "high",
                    "section_index": 0,
                    "parameter_index": 1
                }
            ]
        },
        {
            "section_name": "VITAMINS",
            "category": "Nutrition",
            "parameters": [
                {
                    "name": "25-Hydroxy Vitamin D",
                    "value": 9.0,
                    "unit": "ng/mL",
                    "reference_range": "<20.0-Deficiency",
                    "is_abnormal": True,
                    "direction": "low",
                    "section_index": 1,
                    "parameter_index": 0
                }
            ]
        }
    ],
    "abnormal_parameters": [
        {
            "name": "Cholesterol Total",
            "value": 201,
            "unit": "mg/dL",
            "reference_range": "≤200",
            "direction": "high",
            "section_name": "LIPID PROFILE",
            "category": "Clinical Biochemistry",
            "severity": 2  # Scale of 1-5
        },
        {
            "name": "Cholesterol-LDL",
            "value": 134,
            "unit": "mg/dL",
            "reference_range": "≤100",
            "direction": "high",
            "section_name": "LIPID PROFILE",
            "category": "Clinical Biochemistry",
            "severity": 3
        },
        {
            "name": "25-Hydroxy Vitamin D",
            "value": 9.0,
            "unit": "ng/mL",
            "reference_range": "<20.0-Deficiency",
            "direction": "low",
            "section_name": "VITAMINS",
            "category": "Nutrition",
            "severity": 4
        }
    ],
    "summary": {
        "normal_count": 62,
        "abnormal_count": 9,
        "critical_count": 2,
        "health_score": 76,
        "risk_assessment": {
            "cardiovascular_risk": 35,  # Percentage
            "metabolic_risk": 20,
            "overall_risk_level": "Moderate",
            "risk_factors": ["High LDL Cholesterol", "Vitamin D Deficiency"]
        }
    },
    "metadata": {
        "processing_time": 93.91,
        "processing_timestamp": datetime.datetime.now(),
        "model_used": "claude-3-7-sonnet-20250219",
        "provider": "claude"
    },
    "created_at": datetime.datetime.now(),
    "updated_at": datetime.datetime.now()
}
reports.insert_one(report_doc)

# Insert insights document
insights_doc = {
    "_id": ObjectId(),
    "report_id": report_id,
    "user_id": user_id,
    "conditions": [
        {
            "name": "Vitamin D Deficiency",
            "confidence": 0.95,
            "parameters": ["25-Hydroxy Vitamin D"],
            "description": "Severe vitamin D deficiency detected with levels at 9.00 ng/mL, well below the sufficient range (30-100 ng/mL).",
            "severity": 4,
            "action_required": True,
            "related_body_systems": ["Skeletal", "Immune"]
        },
        {
            "name": "Dyslipidemia",
            "confidence": 0.8,
            "parameters": ["Cholesterol Total", "Cholesterol-LDL"],
            "description": "Elevated total cholesterol, LDL cholesterol, and cholesterol/HDL ratio indicate dyslipidemia, increasing cardiovascular disease risk.",
            "severity": 3,
            "action_required": True,
            "related_body_systems": ["Cardiovascular"]
        }
    ],
    "overall_assessment": "Your health report shows several areas requiring attention, including significant vitamin D deficiency and elevated cholesterol levels that increase cardiovascular risk.",
    "created_at": datetime.datetime.now()
}
insights.insert_one(insights_doc)

# Insert recommendations document
recommendations_doc = {
    "_id": ObjectId(),
    "report_id": report_id,
    "user_id": user_id,
    "medical_recommendations": [
        {
            "condition": "Vitamin D Deficiency",
            "action": "Consult with healthcare provider about vitamin D supplementation",
            "urgency": "High",
            "specialist_type": "Endocrinologist",
            "timeframe": "Within 2 weeks"
        },
        {
            "condition": "Dyslipidemia",
            "action": "Discuss lipid management options with your doctor",
            "urgency": "Medium",
            "specialist_type": "Cardiologist",
            "timeframe": "Within 1 month"
        }
    ],
    "dietary_recommendations": {
        "foods_to_increase": [
            {
                "name": "Fatty fish (salmon, mackerel, sardines)",
                "benefits": "Rich in vitamin D and omega-3 fatty acids that help lower cholesterol",
                "frequency": "2-3 times per week",
                "nutrients": ["Vitamin D", "Omega-3"],
                "addressing": ["Vitamin D Deficiency", "Dyslipidemia"]
            },
            {
                "name": "Leafy green vegetables (spinach, kale)",
                "benefits": "Good source of iron, fiber, and nutrients that support cardiovascular health",
                "frequency": "Daily",
                "nutrients": ["Iron", "Fiber", "Antioxidants"],
                "addressing": ["Dyslipidemia"]
            }
        ],
        "foods_to_decrease": [
            {
                "name": "High-cholesterol foods",
                "reason": "To reduce LDL cholesterol levels",
                "alternatives": ["Lean proteins", "Plant sterols"]
            }
        ]
    },
    "lifestyle_recommendations": [
        {
            "type": "Exercise",
            "description": "Regular moderate exercise to improve cardiovascular health and cholesterol levels",
            "frequency": "At least 150 minutes per week",
            "addressing": ["Dyslipidemia"]
        },
        {
            "type": "Sun Exposure",
            "description": "Moderate sun exposure to boost vitamin D production",
            "frequency": "15-30 minutes several times a week",
            "addressing": ["Vitamin D Deficiency"]
        }
    ],
    "testing_recommendations": [
        {
            "test": "Lipid Profile",
            "reason": "To monitor response to dietary and lifestyle changes",
            "timeframe": "In 3 months",
            "urgency": "Medium"
        },
        {
            "test": "Vitamin D Level",
            "reason": "To assess effectiveness of vitamin D supplementation",
            "timeframe": "In 3 months",
            "urgency": "Medium"
        }
    ],
    "created_at": datetime.datetime.now()
}
recommendations.insert_one(recommendations_doc)

# Insert parameter history document
parameter_history_doc = {
    "_id": ObjectId(),
    "user_id": user_id,
    "parameter_name": "Cholesterol Total",
    "values": [
        {
            "value": 201,
            "unit": "mg/dL",
            "is_abnormal": True,
            "direction": "high",
            "report_id": report_id,
            "report_date": datetime.datetime(2025, 1, 21)
        },
        {
            "value": 215,
            "unit": "mg/dL",
            "is_abnormal": True,
            "direction": "high",
            "report_id": ObjectId(),
            "report_date": datetime.datetime(2024, 7, 15)
        },
        {
            "value": 185,
            "unit": "mg/dL",
            "is_abnormal": False,
            "direction": None,
            "report_id": ObjectId(),
            "report_date": datetime.datetime(2024, 1, 10)
        }
    ],
    "last_updated": datetime.datetime.now()
}
parameter_history.insert_one(parameter_history_doc)

# Insert vitamin D history
parameter_history_doc2 = {
    "_id": ObjectId(),
    "user_id": user_id,
    "parameter_name": "25-Hydroxy Vitamin D",
    "values": [
        {
            "value": 9.0,
            "unit": "ng/mL",
            "is_abnormal": True,
            "direction": "low",
            "report_id": report_id,
            "report_date": datetime.datetime(2025, 1, 21)
        },
        {
            "value": 12.5,
            "unit": "ng/mL",
            "is_abnormal": True,
            "direction": "low",
            "report_id": ObjectId(),
            "report_date": datetime.datetime(2024, 7, 15)
        }
    ],
    "last_updated": datetime.datetime.now()
}
parameter_history.insert_one(parameter_history_doc2)

# Insert educational content
educational_content_doc = {
    "_id": ObjectId(),
    "parameter_name": "Cholesterol Total",
    "content": {
        "explanation": "Cholesterol is a waxy substance found in your blood that's needed for building healthy cells. However, high levels can increase the risk of heart disease.",
        "normal_function": "Cholesterol is essential for building cells and producing hormones, vitamin D, and substances that help digest foods.",
        "abnormal_implications": "High cholesterol can lead to fatty deposits in blood vessels, restricting blood flow to your heart, brain, and other organs.",
        "sources": ["American Heart Association", "National Heart, Lung, and Blood Institute"],
        "tags": ["cardiovascular", "lipids", "heart-health"]
    },
    "external_links": [
        {
            "title": "American Heart Association - Cholesterol",
            "url": "https://www.heart.org/en/health-topics/cholesterol",
            "resource_type": "Article"
        },
        {
            "title": "Understanding Cholesterol Levels",
            "url": "https://medlineplus.gov/cholesterollevelswhatyouneedtoknow.html",
            "resource_type": "Guide"
        }
    ],
    "created_at": datetime.datetime.now(),
    "updated_at": datetime.datetime.now()
}
educational_content.insert_one(educational_content_doc)

# Insert user preferences
user_preferences_doc = {
    "_id": ObjectId(),
    "user_id": user_id,
    "dashboard_settings": {
        "default_view": "Overview",
        "preferred_visualization": "Charts",
        "notification_preferences": {
            "email_alerts": True,
            "sms_alerts": False,
            "alert_threshold": "All Abnormal"
        }
    },
    "health_goals": [
        {
            "parameter": "Cholesterol Total",
            "target_value": 180,
            "target_date": datetime.datetime(2025, 7, 21),
            "progress": [
                {
                    "date": datetime.datetime(2025, 1, 21),
                    "value": 201
                }
            ]
        },
        {
            "parameter": "25-Hydroxy Vitamin D",
            "target_value": 30,
            "target_date": datetime.datetime(2025, 4, 21),
            "progress": [
                {
                    "date": datetime.datetime(2025, 1, 21),
                    "value": 9.0
                }
            ]
        }
    ],
    "saved_resources": [],
    "created_at": datetime.datetime.now(),
    "updated_at": datetime.datetime.now()
}
user_preferences.insert_one(user_preferences_doc)

# Sample subscription document
subscription_id = ObjectId()
subscription_doc = {
    "_id": subscription_id,
    "user_id": user_id,
    "plan": "premium",  # "free", "basic", "premium"
    "status": "active", # "active", "cancelled", "expired"
    "price": 9.99,      # Monthly price
    "features": ["doctor_recommendations", "diet_plans", "grocery_lists"],
    "start_date": datetime.datetime.now() - datetime.timedelta(days=30),
    "expiration_date": datetime.datetime.now() + datetime.timedelta(days=30),
    "auto_renew": True,
    "trial_used": True,
    "created_at": datetime.datetime.now(),
    "updated_at": datetime.datetime.now()
}
subscriptions.insert_one(subscription_doc)

# Sample payment document
payment_doc = {
    "_id": ObjectId(),
    "user_id": user_id,
    "subscription_id": subscription_id,
    "amount": 9.99,
    "currency": "USD",
    "payment_method": "credit_card",
    "payment_method_details": {
        "last4": "1234",
        "brand": "Visa",
        "exp_month": 12,
        "exp_year": 2026
    },
    "status": "succeeded",  # "succeeded", "failed", "refunded"
    "payment_date": datetime.datetime.now() - datetime.timedelta(days=30),
    "receipt_url": "https://payments.example.com/receipts/123456",
    "invoice_id": "INV-12345",
    "created_at": datetime.datetime.now()
}
payments.insert_one(payment_doc)

# Sample analytics document for user registrations
analytics_doc1 = {
    "_id": ObjectId(),
    "date": datetime.datetime.now().replace(hour=0, minute=0, second=0, microsecond=0),
    "event_type": "registrations",
    "count": 15,
    "breakdown": {
        "organic": 8,
        "referral": 4,
        "social": 3
    },
    "created_at": datetime.datetime.now()
}
analytics.insert_one(analytics_doc1)

# Sample analytics document for subscription conversions
analytics_doc2 = {
    "_id": ObjectId(),
    "date": datetime.datetime.now().replace(hour=0, minute=0, second=0, microsecond=0),
    "event_type": "subscription_conversions",
    "count": 5,
    "breakdown": {
        "free_to_basic": 3,
        "free_to_premium": 1,
        "basic_to_premium": 1
    },
    "conversion_rate": 0.33,  # 33% of free users converted that day
    "created_at": datetime.datetime.now()
}
analytics.insert_one(analytics_doc2)

# Sample analytics document for feature usage
analytics_doc3 = {
    "_id": ObjectId(),
    "date": datetime.datetime.now().replace(hour=0, minute=0, second=0, microsecond=0),
    "event_type": "feature_usage",
    "counts": {
        "report_uploads": 25,
        "doctor_recommendations_viewed": 18,
        "diet_plans_generated": 12,
        "grocery_lists_generated": 7
    },
    "created_at": datetime.datetime.now()
}
analytics.insert_one(analytics_doc3)

# Print database structure
print("\nDatabase 'healthinsighttoday' created with the following collections:")
print("\n".join(db.list_collection_names()))

print("\nSample data has been inserted into all collections.")
print("\nCollection schemas:")
for collection in db.list_collection_names():
    print(f"\n{collection.upper()}:\n" + "-" * len(collection))
    sample = db[collection].find_one()
    # Print first-level keys and their types
    for key, value in sample.items():
        value_type = type(value).__name__
        if isinstance(value, dict):
            value_desc = "{" + ", ".join(f"{k}" for k in value.keys()) + "}"
        elif isinstance(value, list):
            if len(value) > 0:
                first_item = value[0]
                if isinstance(first_item, dict):
                    value_desc = "[{" + ", ".join(f"{k}" for k in first_item.keys()) + "}, ...]"
                else:
                    value_desc = f"[{type(first_item).__name__}, ...]"
            else:
                value_desc = "[]"
        else:
            value_desc = str(value)[:30] + ("..." if len(str(value)) > 30 else "")
        print(f"  {key}: {value_type} = {value_desc}")

print("\nDatabase setup complete!")
