// AI Service for Ayurvedic Analysis
// This file handles integration with various AI APIs

export interface AIAnalysisRequest {
  patientSummary: string;
  patientName: string;
}

export interface AIAnalysisResponse {
  analysis: string;
  error?: string;
}

// OpenAI API Integration
export const analyzeWithOpenAI = async (request: AIAnalysisRequest): Promise<AIAnalysisResponse> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key not found. Please add VITE_OPENAI_API_KEY to your .env file');
  }

  const prompt = `
Please analyze this patient from an Ayurvedic perspective:

${request.patientSummary}

Please provide a comprehensive Ayurvedic analysis including:

1. **Prakriti Assessment** (Constitutional Analysis):
   - Vata, Pitta, Kapha balance
   - Primary and secondary dosha identification
   - Physical and mental characteristics

2. **Vikriti Assessment** (Current Imbalance):
   - Current dosha imbalances
   - Symptoms and signs
   - Seasonal and lifestyle factors

3. **Dietary Recommendations**:
   - Foods to favor and avoid
   - Meal timing and preparation
   - Spices and herbs beneficial

4. **Lifestyle Recommendations**:
   - Daily routine (Dinacharya)
   - Exercise and yoga suggestions
   - Sleep and stress management

5. **Herbal Recommendations**:
   - Specific herbs for balance
   - Formulations to consider
   - Precautions and contraindications

6. **Therapeutic Approaches**:
   - Panchakarma recommendations
   - Massage and bodywork
   - Meditation and breathing techniques

Please provide practical, actionable advice based on Ayurvedic principles. Format the response in markdown.
  `;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert Ayurvedic practitioner with deep knowledge of doshas, herbs, and traditional healing methods. Provide detailed, practical advice.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const analysis = data.choices[0]?.message?.content || 'No analysis generated';

    return { analysis };
  } catch (error) {
    console.error('OpenAI API error:', error);
    return { 
      analysis: '', 
      error: error instanceof Error ? error.message : 'Failed to analyze with OpenAI' 
    };
  }
};

// Anthropic Claude API Integration
export const analyzeWithClaude = async (request: AIAnalysisRequest): Promise<AIAnalysisResponse> => {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    throw new Error('Anthropic API key not found. Please add VITE_ANTHROPIC_API_KEY to your .env file');
  }

  const prompt = `
Please analyze this patient from an Ayurvedic perspective:

${request.patientSummary}

Please provide a comprehensive Ayurvedic analysis including:

1. **Prakriti Assessment** (Constitutional Analysis):
   - Vata, Pitta, Kapha balance
   - Primary and secondary dosha identification
   - Physical and mental characteristics

2. **Vikriti Assessment** (Current Imbalance):
   - Current dosha imbalances
   - Symptoms and signs
   - Seasonal and lifestyle factors

3. **Dietary Recommendations**:
   - Foods to favor and avoid
   - Meal timing and preparation
   - Spices and herbs beneficial

4. **Lifestyle Recommendations**:
   - Daily routine (Dinacharya)
   - Exercise and yoga suggestions
   - Sleep and stress management

5. **Herbal Recommendations**:
   - Specific herbs for balance
   - Formulations to consider
   - Precautions and contraindications

6. **Therapeutic Approaches**:
   - Panchakarma recommendations
   - Massage and bodywork
   - Meditation and breathing techniques

Please provide practical, actionable advice based on Ayurvedic principles. Format the response in markdown.
  `;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const analysis = data.content[0]?.text || 'No analysis generated';

    return { analysis };
  } catch (error) {
    console.error('Claude API error:', error);
    return { 
      analysis: '', 
      error: error instanceof Error ? error.message : 'Failed to analyze with Claude' 
    };
  }
};

// Mock AI Service (for demo/testing)
export const analyzeWithMockAI = async (request: AIAnalysisRequest): Promise<AIAnalysisResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const mockAnalysis = `
## Ayurvedic Analysis for ${request.patientName}

### 🧘‍♀️ Prakriti Assessment (Constitutional Analysis)
Based on the patient's profile, this appears to be a **Vata-Pitta** constitution with the following characteristics:

**Primary Dosha: Vata**
- Quick thinking and creative mind
- Variable appetite and digestion
- Tendency toward anxiety and worry
- Light, thin build with dry skin

**Secondary Dosha: Pitta**
- Strong metabolism and sharp intellect
- Leadership qualities and determination
- Sensitive to heat and spicy foods
- Medium build with warm body temperature

### ⚖️ Vikriti Assessment (Current Imbalance)
Current imbalances may include:
- **Vata aggravation**: Stress, irregular routine, dry skin
- **Pitta aggravation**: Work-related stress, digestive issues
- **Kapha deficiency**: Need for grounding and stability

### 🍽️ Dietary Recommendations

**Foods to Favor:**
- Sweet, sour, and salty tastes
- Warm, cooked foods
- Ghee, sesame oil
- Dairy products (if tolerated)
- Nuts and seeds
- Root vegetables

**Foods to Avoid:**
- Cold, dry, and bitter foods
- Raw vegetables
- Carbonated drinks
- Excessive caffeine
- Very spicy foods

**Meal Timing:**
- Regular meal times (7-8 AM, 12-1 PM, 6-7 PM)
- Light dinner before sunset
- Avoid eating when stressed

### 🌿 Herbal Recommendations

**Primary Herbs:**
- **Ashwagandha**: For stress and energy
- **Brahmi**: For mental clarity
- **Shatavari**: For hormonal balance
- **Ginger**: For digestion
- **Turmeric**: For inflammation

**Formulations to Consider:**
- Chyawanprash (immunity booster)
- Triphala (digestive health)
- Brahmi tablets (mental health)

### 🏃‍♀️ Lifestyle Recommendations

**Daily Routine (Dinacharya):**
- Wake up before 6 AM
- Oil pulling with sesame oil
- Abhyanga (self-massage) with warm oil
- Gentle yoga and pranayama
- Regular meditation practice

**Exercise:**
- Gentle, grounding exercises
- Walking in nature
- Yoga (especially Vata-pacifying poses)
- Tai Chi or Qigong

**Stress Management:**
- Regular meditation (20-30 minutes daily)
- Deep breathing exercises
- Adequate sleep (7-8 hours)
- Warm oil massage

### 🧘‍♂️ Therapeutic Approaches

**Panchakarma Recommendations:**
- Abhyanga (therapeutic massage)
- Shirodhara (oil pouring on forehead)
- Nasya (nasal administration of oils)

**Bodywork:**
- Warm oil massage with sesame oil
- Gentle pressure point massage
- Aromatherapy with calming oils

### ⚠️ Precautions
- Avoid excessive cold and wind
- Maintain regular routine
- Stay hydrated with warm water
- Avoid overexertion and stress

### 📋 Action Plan
1. **Week 1-2**: Implement daily routine and dietary changes
2. **Week 3-4**: Add herbal supplements
3. **Month 2**: Begin regular bodywork and therapies
4. **Ongoing**: Monitor progress and adjust as needed

*Note: This analysis is based on general Ayurvedic principles. For personalized recommendations, consult with a qualified Ayurvedic practitioner.*
  `;

  return { analysis: mockAnalysis };
};

// Main AI analysis function - choose which service to use
export const analyzePatientWithAI = async (request: AIAnalysisRequest): Promise<AIAnalysisResponse> => {
  // You can choose which AI service to use here
  const aiService = import.meta.env.VITE_AI_SERVICE || 'mock'; // 'openai', 'claude', or 'mock'
  
  try {
    switch (aiService) {
      case 'openai':
        return await analyzeWithOpenAI(request);
      case 'claude':
        return await analyzeWithClaude(request);
      case 'mock':
      default:
        return await analyzeWithMockAI(request);
    }
  } catch (error) {
    console.error('AI analysis error:', error);
    return { 
      analysis: '', 
      error: error instanceof Error ? error.message : 'Failed to analyze with AI' 
    };
  }
}; 