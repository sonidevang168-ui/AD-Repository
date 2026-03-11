/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  User, 
  MapPin, 
  GraduationCap, 
  IndianRupee, 
  Users, 
  Calendar, 
  Search, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Types
interface StudentProfile {
  age: string;
  gender: string;
  familyIncome: string;
  state: string;
  educationLevel: string;
  category: string;
  isDifferentlyAbled: boolean;
}

interface Scheme {
  name: string;
  eligibility: string;
  benefit: string;
  applicationLink: string;
  description: string;
}

const INITIAL_PROFILE: StudentProfile = {
  age: '',
  gender: '',
  familyIncome: '',
  state: '',
  educationLevel: '',
  category: '',
  isDifferentlyAbled: false,
};

const PREDEFINED_SCHEMES: Scheme[] = [
  {
    name: "Pragati Scholarship",
    eligibility: "Female students, Family income below 8 lakh, Technical education (Degree/Diploma)",
    benefit: "₹50,000 per year",
    applicationLink: "https://www.aicte-india.org/schemes/students-development-schemes/pragati-scholarship-scheme",
    description: "Empowering girls to pursue technical education."
  },
  {
    name: "AICTE Saksham Scholarship",
    eligibility: "Differently abled students (disability > 40%), Technical courses (Degree/Diploma), Family income below 8 lakh",
    benefit: "₹50,000 per year",
    applicationLink: "https://www.aicte-india.org/schemes/students-development-schemes/saksham-scholarship-scheme",
    description: "Support for specially-abled students to pursue technical education."
  }
];

export default function App() {
  const [step, setStep] = useState<'form' | 'loading' | 'results'>('form');
  const [profile, setProfile] = useState<StudentProfile>(INITIAL_PROFILE);
  const [recommendations, setRecommendations] = useState<Scheme[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setProfile(prev => ({ ...prev, [name]: checked }));
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  const findSchemes = async () => {
    setStep('loading');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `
        You are an expert on Indian Government Scholarship Schemes. 
        Based on this student profile, recommend the top 3 matching schemes.
        
        Student Profile:
        - Age: ${profile.age}
        - Gender: ${profile.gender}
        - Family Income: ${profile.familyIncome}
        - State: ${profile.state}
        - Education Level: ${profile.educationLevel}
        - Category: ${profile.category}
        - Differently Abled: ${profile.isDifferentlyAbled ? 'Yes' : 'No'}

        Predefined Schemes to consider first if eligible:
        1. Pragati Scholarship (Female, Technical Education, Income < 8L)
        2. AICTE Saksham Scholarship (Differently Abled, Technical Education, Income < 8L)

        Please provide:
        1. A brief analysis of eligibility.
        2. A list of 3 schemes in JSON format within your response.
        
        The JSON should be an array of objects with:
        {
          "name": "Scheme Name",
          "eligibility": "Brief eligibility criteria",
          "benefit": "Brief benefit description",
          "applicationLink": "Official URL if known, otherwise search URL",
          "description": "Short description"
        }

        Return the response as a Markdown text with the analysis, followed by the JSON block.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const text = response.text || '';
      setAiAnalysis(text.split('```json')[0]);
      
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        const parsedSchemes = JSON.parse(jsonMatch[1]);
        setRecommendations(parsedSchemes);
      } else {
        // Fallback to predefined if AI fails JSON
        setRecommendations(PREDEFINED_SCHEMES.slice(0, 3));
      }
      
      setStep('results');
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setRecommendations(PREDEFINED_SCHEMES.slice(0, 3));
      setAiAnalysis("We encountered an error while fetching AI recommendations. Here are some standard schemes you might be eligible for.");
      setStep('results');
    }
  };

  const reset = () => {
    setProfile(INITIAL_PROFILE);
    setStep('form');
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1a1a1a] font-sans selection:bg-emerald-100">
      {/* Header */}
      <header className="bg-white border-b border-black/5 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
              <Search size={20} />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">SchemeFinder AI</h1>
              <p className="text-xs text-muted-foreground">Government Scholarship Assistant</p>
            </div>
          </div>
          {step === 'results' && (
            <button 
              onClick={reset}
              className="text-sm font-medium flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 hover:bg-black/5 transition-colors"
            >
              <RefreshCw size={14} />
              Start Over
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div 
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-semibold tracking-tight">Find your eligible schemes</h2>
                <p className="text-muted-foreground text-lg">Tell us a bit about yourself to get personalized recommendations.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 rounded-3xl shadow-sm border border-black/5">
                {/* Age */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <Calendar size={16} className="text-emerald-600" />
                    Age
                  </label>
                  <input 
                    type="number" 
                    name="age"
                    value={profile.age}
                    onChange={handleInputChange}
                    placeholder="e.g. 19"
                    className="w-full px-4 py-3 rounded-xl border border-black/10 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <User size={16} className="text-emerald-600" />
                    Gender
                  </label>
                  <select 
                    name="gender"
                    value={profile.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-black/10 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none bg-white"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Family Income */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <IndianRupee size={16} className="text-emerald-600" />
                    Annual Family Income
                  </label>
                  <input 
                    type="number" 
                    name="familyIncome"
                    value={profile.familyIncome}
                    onChange={handleInputChange}
                    placeholder="e.g. 500000"
                    className="w-full px-4 py-3 rounded-xl border border-black/10 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                {/* State */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <MapPin size={16} className="text-emerald-600" />
                    State
                  </label>
                  <input 
                    type="text" 
                    name="state"
                    value={profile.state}
                    onChange={handleInputChange}
                    placeholder="e.g. Maharashtra"
                    className="w-full px-4 py-3 rounded-xl border border-black/10 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                {/* Education Level */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <GraduationCap size={16} className="text-emerald-600" />
                    Education Level
                  </label>
                  <select 
                    name="educationLevel"
                    value={profile.educationLevel}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-black/10 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none bg-white"
                  >
                    <option value="">Select Level</option>
                    <option value="10th Pass">10th Pass</option>
                    <option value="12th Pass">12th Pass</option>
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Postgraduate">Postgraduate</option>
                    <option value="Technical (Diploma)">Technical (Diploma)</option>
                    <option value="Technical (Degree)">Technical (Degree)</option>
                  </select>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <Users size={16} className="text-emerald-600" />
                    Category
                  </label>
                  <select 
                    name="category"
                    value={profile.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-black/10 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none bg-white"
                  >
                    <option value="">Select Category</option>
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                  </select>
                </div>

                {/* Differently Abled */}
                <div className="md:col-span-2 flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <input 
                    type="checkbox" 
                    id="isDifferentlyAbled"
                    name="isDifferentlyAbled"
                    checked={profile.isDifferentlyAbled}
                    onChange={handleInputChange}
                    className="w-5 h-5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="isDifferentlyAbled" className="text-sm font-medium text-emerald-900">
                    I am differently abled (PwD)
                  </label>
                </div>

                <div className="md:col-span-2 pt-4">
                  <button 
                    onClick={findSchemes}
                    disabled={!profile.age || !profile.gender || !profile.familyIncome || !profile.state || !profile.educationLevel || !profile.category}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 group"
                  >
                    Find Matching Schemes
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'loading' && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 space-y-6"
            >
              <div className="relative">
                <div className="w-20 h-20 border-4 border-emerald-100 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-20 h-20 border-t-4 border-emerald-600 rounded-full animate-spin"></div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">Analyzing Eligibility...</h3>
                <p className="text-muted-foreground">Our AI is scanning government databases for the best matches.</p>
              </div>
            </motion.div>
          )}

          {step === 'results' && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-10"
            >
              {/* AI Analysis Section */}
              <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 font-bold">
                  <Info size={20} />
                  <span>Eligibility Analysis</span>
                </div>
                <div className="prose prose-emerald max-w-none text-muted-foreground leading-relaxed">
                  <Markdown>{aiAnalysis}</Markdown>
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  <CheckCircle2 className="text-emerald-600" />
                  Top 3 Recommended Schemes
                </h3>
                
                <div className="grid grid-cols-1 gap-6">
                  {recommendations.map((scheme, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group bg-white p-8 rounded-3xl border border-black/5 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all"
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="space-y-4 flex-1">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Match #{idx + 1}</span>
                            <h4 className="text-xl font-bold group-hover:text-emerald-700 transition-colors">{scheme.name}</h4>
                          </div>
                          <p className="text-muted-foreground leading-relaxed">{scheme.description}</p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div className="space-y-1">
                              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Benefit</span>
                              <p className="font-semibold text-emerald-700">{scheme.benefit}</p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Eligibility</span>
                              <p className="text-sm">{scheme.eligibility}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="shrink-0">
                          <a 
                            href={scheme.applicationLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-2xl font-bold hover:bg-emerald-600 transition-all group/btn"
                          >
                            Apply Now
                            <ExternalLink size={16} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="bg-emerald-600 p-8 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1 text-center md:text-left">
                  <h4 className="text-xl font-bold">Need more help?</h4>
                  <p className="text-emerald-100">Our AI can answer specific questions about these schemes.</p>
                </div>
                <button 
                  onClick={reset}
                  className="bg-white text-emerald-600 px-8 py-3 rounded-2xl font-bold hover:bg-emerald-50 transition-all"
                >
                  Ask Another Question
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-4xl mx-auto px-6 py-12 border-t border-black/5 text-center">
        <p className="text-sm text-muted-foreground">
          &copy; 2026 SchemeFinder AI. Data provided for informational purposes. 
          Always verify details on official government portals.
        </p>
      </footer>
    </div>
  );
}
