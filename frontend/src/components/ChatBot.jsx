import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { MessageCircle, Send } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

// Greeting responses
const GREETINGS = {
  hello: ["Hello! How can I help you with placement preparation today?", 
          "Hi there! I'm your placement assistant. What would you like to know?",
          "Greetings! I can help with resume tips, interview prep, and more. What do you need?"],
  help: ["I can help with resume building, interview preparation, skill development, and job search strategies. What would you like assistance with?",
         "I'm your placement assistant! I can provide advice on resumes, interviews, skills to develop, and job search strategies. What are you interested in?",
         "I'm here to help you with your placement journey! I can offer tips on resume writing, interview skills, career development, and job applications."]
};

// Knowledge base categorized by topics
const KNOWLEDGE_BASE = {
  resume: [
    "For your resume, focus on highlighting relevant projects and coursework related to the job you're applying for.",
    "Keep your resume concise - ideally 1-2 pages with bullet points highlighting achievements rather than just responsibilities.",
    "Include a skills section that lists both technical skills and soft skills relevant to your target role.",
    "Quantify your achievements whenever possible (e.g., 'Improved process efficiency by 30%' rather than just 'Improved process efficiency').",
    "Tailor your resume for each application by matching keywords from the job description.",
    "Include your GitHub or portfolio link if you have coding projects to showcase.",
    "For placement applications, highlight internships, projects, and relevant coursework even if you don't have much work experience."
  ],
  interview: [
    "Prepare for technical interviews by practicing coding problems on platforms like LeetCode, HackerRank, and CodeSignal.",
    "For behavioral interviews, use the STAR method (Situation, Task, Action, Result) to structure your answers.",
    "Research the company thoroughly before your interview - understand their products, culture, and recent news.",
    "Prepare thoughtful questions to ask your interviewer about the role, team, and company.",
    "Practice common interview questions like 'Tell me about yourself', 'Why do you want to work here?', and 'What's your greatest weakness?'",
    "For technical roles, be ready to explain your approach to problem-solving and your thought process during coding challenges.",
    "Dress professionally for interviews, even if the company has a casual dress code."
  ],
  skills: [
    "Focus on developing both technical skills (like programming languages) and soft skills (like communication and teamwork).",
    "For tech roles, having a strong foundation in data structures and algorithms is essential.",
    "Learn industry-standard tools and technologies used in your field - check job descriptions to identify what's in demand.",
    "Work on personal projects that demonstrate your skills and passion for your field.",
    "Consider getting relevant certifications to boost your resume and validate your skills.",
    "Join hackathons, coding competitions, or open-source projects to gain practical experience.",
    "Soft skills like communication, problem-solving, and teamwork are just as important as technical skills for placement success."
  ],
  jobSearch: [
    "Use multiple job platforms and the campus placement portal to maximize your opportunities.",
    "Leverage LinkedIn and other professional networks to connect with alumni and industry professionals.",
    "Attend campus recruitment events, job fairs, and industry seminars to meet potential employers.",
    "Create a strong LinkedIn profile with a professional photo, detailed experience, and skills endorsements.",
    "Follow companies you're interested in on social media to stay updated on job openings and company news.",
    "Consider internships or part-time positions to gain experience if you're just starting out.",
    "Don't limit yourself to only applying to well-known companies - smaller companies can offer excellent learning opportunities."
  ],
  preparation: [
    "Start preparing for placements at least 6 months in advance, focusing on building your skills and portfolio.",
    "Join placement preparation groups or find study partners to practice interviews with.",
    "Keep track of the placement season calendar and deadlines for various companies.",
    "Prepare a pitch about yourself that you can deliver confidently in 30-60 seconds.",
    "Practice mock interviews with friends, seniors, or using online platforms.",
    "Keep up with industry trends and news related to your field.",
    "Develop your problem-solving skills through regular practice with coding challenges or case studies."
  ],
  google: [
    "For Google interviews, focus heavily on data structures, algorithms, and system design questions.",
    "Google's interview process typically includes multiple rounds: phone screening, technical interviews, and a team matching phase.",
    "Practice coding on a whiteboard or Google Docs without code completion or syntax highlighting, as that's how coding interviews are conducted.",
    "Google interviewers look for problem-solving ability, coding skills, communication, and cultural fit.",
    "Familiarize yourself with Google's leadership principles and prepare examples that demonstrate these qualities.",
    "For Google's technical interviews, be prepared to analyze the time and space complexity of your solutions.",
    "Mock interviews are extremely valuable for Google preparation - find someone who can give you honest feedback."
  ],
  amazon: [
    "Amazon interviews focus heavily on their leadership principles - prepare examples for each one.",
    "For technical roles at Amazon, be ready for system design questions and scalability discussions.",
    "Amazon interviewers often ask behavioral questions using the STAR method, focusing on past challenges and how you overcame them.",
    "Be prepared to discuss how you've delivered results, overcome obstacles, and worked with difficult team dynamics.",
    "Amazon values ownership and customer obsession - prepare examples that demonstrate these qualities.",
    "For coding interviews, Amazon focuses on efficiency, correctness, and your ability to handle edge cases.",
    "Practice Amazon's online assessments which typically involve coding problems and work simulation exercises."
  ],
  microsoft: [
    "Microsoft interviews typically include coding, design, and behavioral questions.",
    "Be prepared to discuss your past projects in depth, with a focus on your specific contributions.",
    "Microsoft values problem-solving ability and creativity - be ready to think outside the box.",
    "For technical roles, practice problems related to data structures, algorithms, and system design.",
    "Microsoft interviewers often assess how you handle feedback - be open to suggestions during interviews.",
    "Prepare to discuss how you've collaborated with others and handled conflicts in team settings.",
    "Microsoft values a growth mindset - demonstrate your ability to learn and adapt to new challenges."
  ],
  facebook: [
    "For Meta (Facebook) interviews, focus on coding efficiency and optimization.",
    "Meta's technical interviews often involve problems related to data structures, algorithms, and product design.",
    "Be prepared to discuss how you would build, scale, and improve Meta's products.",
    "Meta values fast execution and impact - prepare examples that demonstrate these qualities.",
    "Practice coding on a whiteboard or in a simple text editor, as that's how coding interviews are conducted.",
    "Meta interviews often include product sense questions - think about how you would improve existing products.",
    "Be ready to discuss how you've worked in fast-paced environments and handled rapid changes."
  ],
  apple: [
    "Apple interviews focus on technical excellence and attention to detail.",
    "Be prepared to discuss your approach to design and user experience.",
    "Apple values innovation and quality - prepare examples that demonstrate these qualities.",
    "For technical roles, expect detailed questions about your past projects and specific contributions.",
    "Apple interviewers often assess how you handle ambiguity and uncertainty.",
    "Practice explaining complex technical concepts in simple terms.",
    "Apple values collaboration and teamwork - prepare examples of how you've worked effectively with others."
  ],
  googleQuestions: [
    "Common Google interview questions include: 'Design a system like Google Maps', 'Implement a LRU cache', 'Find the k most frequent elements in an array', and 'Design a URL shortening service'.",
    "Technical questions at Google often include: 'Write code to detect a cycle in a linked list', 'Implement a trie data structure', and 'Design an elevator system for a building'.",
    "Google behavioral questions include: 'Tell me about a time you faced a challenge and how you overcame it', 'How do you handle disagreements with teammates?', and 'Describe a situation where you had to make a decision with incomplete information'.",
    "System design questions at Google include: 'Design YouTube', 'Design Google Drive', and 'Design a distributed key-value store'.",
    "Some Google coding challenges include: 'Implement a function to check if a binary tree is balanced', 'Find the longest substring without repeating characters', and 'Implement a queue using two stacks'."
  ],
  amazonQuestions: [
    "Amazon's behavioral questions include: 'Tell me about a time you went above and beyond for a customer', 'Describe a situation where you had to make a decision that wasn't popular', and 'Give an example of when you took a calculated risk'.",
    "Technical questions at Amazon often include: 'Design a system that can handle millions of transactions per second', 'Implement a function to find the least common ancestor in a binary tree', and 'Write an algorithm to detect a loop in a linked list'.",
    "Amazon system design questions include: 'Design Amazon's recommendation system', 'Design a warehouse management system', and 'Design a system like Amazon Prime Video'.",
    "Leadership principle questions at Amazon include: 'Tell me about a time you had to deliver results in a tight deadline', 'How do you ensure customer obsession in your work?', and 'Describe a situation where you had to dive deep into a problem'.",
    "Coding challenges at Amazon include: 'Find the maximum sum subarray', 'Implement a program to check if a string has all unique characters', and 'Design an LRU cache'."
  ],
  microsoftQuestions: [
    "Microsoft technical questions include: 'Write code to find the lowest common ancestor in a binary tree', 'Implement a function to reverse a linked list', and 'Design a parking lot system'.",
    "Behavioral questions at Microsoft include: 'Tell me about a time you had to learn something new quickly', 'How do you handle criticism?', and 'Describe a situation where you influenced others without direct authority'.",
    "System design questions at Microsoft include: 'Design OneDrive', 'Design a chat messaging system like Teams', and 'Design a distributed database'.",
    "Problem-solving questions at Microsoft include: 'How would you test a pen?', 'How many gas stations are there in the United States?', and 'How would you design an elevator system for a tall building?'",
    "Coding challenges at Microsoft include: 'Implement a function to check if a binary tree is a valid BST', 'Find all anagrams in a string', and 'Design a data structure that supports insert, delete, and getRandom in O(1) time'."
  ],
  facebookQuestions: [
    "Meta (Facebook) coding questions include: 'Write a function to find all palindromic substrings in a string', 'Design a data structure to implement an LRU cache', and 'Implement a function to serialize and deserialize a binary tree'.",
    "System design questions at Meta include: 'Design Facebook News Feed', 'Design Instagram', and 'Design a distributed messaging system like WhatsApp'.",
    "Behavioral questions at Meta include: 'Tell me about a time you had to make a decision with limited information', 'Describe a situation where you had to pivot quickly', and 'How do you handle competing priorities?'",
    "Product sense questions at Meta include: 'How would you improve Facebook Marketplace?', 'What metrics would you use to measure the success of Instagram Stories?', and 'How would you design a new feature for WhatsApp?'",
    "Coding challenges at Meta include: 'Find the kth largest element in an array', 'Implement a regular expression matcher', and 'Design an algorithm to detect duplicate files in a file system'."
  ],
  appleQuestions: [
    "Apple technical questions include: 'Describe how you would implement iCloud syncing', 'Write an algorithm to detect patterns in user behavior', and 'Design a system like Apple Pay'.",
    "Behavioral questions at Apple include: 'Tell me about a time you had to deliver a high-quality product under tight constraints', 'How do you ensure attention to detail in your work?', and 'Describe a situation where you had to balance user experience with technical limitations'.",
    "System design questions at Apple include: 'Design iMessage', 'Design Apple Music', and 'Design a distributed file storage system'.",
    "User experience questions at Apple include: 'How would you improve the user experience of Apple Maps?', 'What considerations would you make when designing a new feature for iOS?', and 'How would you make Apple TV more intuitive?'",
    "Coding challenges at Apple include: 'Implement a function to find the median of two sorted arrays', 'Design a data structure to implement an auto-complete feature', and 'Write an algorithm to efficiently search a sorted rotated array'."
  ],
  capabilities: [
    "I can help with resume preparation and optimization to make your application stand out to recruiters.",
    "I can provide guidance on interview techniques for both technical and behavioral interviews at top companies.",
    "I can offer advice on skills development tailored to the specific roles or companies you're targeting.",
    "I can share strategies for effective job searching and application processes.",
    "I can provide company-specific interview preparation tips for companies like Google, Amazon, Microsoft, Meta (Facebook), and Apple.",
    "I can suggest practice interview questions and provide feedback on potential answers.",
    "I can help with general career planning and placement strategies for students and professionals."
  ]
};

// Default responses for when no specific intent is detected
const DEFAULT_RESPONSES = [
  "Could you be more specific about what placement advice you're looking for?",
  "I can help with resume tips, interview preparation, skill development, or job search strategies. What would you like to know?",
  "I'm not sure I understand. Are you asking about resume building, interview preparation, required skills, or job searching?",
  "To better assist you, could you clarify if you're looking for help with interviews, resumes, skills to develop, or job application strategies?"
];

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: 'Hi there! I\'m your placement assistant. How can I help you today?' }
  ]);
  const [lastQueryIntent, setLastQueryIntent] = useState(null);
  const messagesEndRef = useRef(null);
  const { user } = useSelector(store => store.auth);
  
  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);
  
  // Simple function to check if message is a greeting
  const isGreeting = (message) => {
    const text = message.toLowerCase().trim();
    
    // Check for hello variations
    if (text === 'hi' || text === 'hello' || text === 'hey' || text.includes('hello') || 
        text.includes('hi there') || text === 'greetings' || text.includes('good morning') ||
        text.includes('good afternoon') || text.includes('good evening')) {
      return 'hello';
    }
    
    // Check for help variations
    if (text.includes('how can you help') || text.includes('what can you do') || 
        text.includes('help me') || text === 'help' || text.includes('what do you do') ||
        text.includes('how do you help') || text.includes('what can you help with')) {
      return 'help';
    }
    
    return null;
  };

  // Check if query mentions specific companies
  const getCompanyMention = (text) => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('google')) return 'google';
    if (lowerText.includes('amazon')) return 'amazon';
    if (lowerText.includes('microsoft')) return 'microsoft';
    if (lowerText.includes('facebook') || lowerText.includes('meta')) return 'facebook';
    if (lowerText.includes('apple')) return 'apple';
    
    return null;
  };
  
  // Determine the user's intent from their message
  const detectIntent = (message) => {
    const text = message.toLowerCase();
    
    // Check for capabilities questions
    if (text.includes('what can you do') || text.includes('how can you help') || 
        text.includes('what do you do') || text.includes('capabilities') ||
        text === 'help' || text === 'help me') {
      return 'capabilities';
    }
    
    // First check if it's a simple greeting
    const greeting = isGreeting(text);
    if (greeting && !lastQueryIntent) {
      return greeting;
    }
    
    // Check if the user is asking for questions for a specific company
    if (text.includes('question') || text.includes('ask') || text.includes('what should i expect') || 
        text.includes('example')) {
      
      // Check if we're in a company context or if the message mentions a company
      const company = getCompanyMention(text) || 
                     (lastQueryIntent && ['google', 'amazon', 'microsoft', 'facebook', 'apple'].includes(lastQueryIntent) 
                      ? lastQueryIntent : null);
      
      if (company) {
        return `${company}Questions`;
      }
      
      return 'interview'; // Default to general interview if no company context
    }
    
    // Check for specific company mentions when asking about interviews
    if (text.includes('interview')) {
      const company = getCompanyMention(text);
      if (company && KNOWLEDGE_BASE[company]) {
        return company;
      }
      return 'interview';
    }
    
    // Check for resume-related intent
    if (text.includes('resume') || text.includes('cv') || text.includes('portfolio') || 
        text.includes('template') || text.includes('format')) {
      return 'resume';
    }
    
    // Check for skills-related intent
    if (text.includes('skill') || text.includes('learn') || text.includes('knowledge') || 
        text.includes('ability') || text.includes('certification') || text.includes('project')) {
      return 'skills';
    }
    
    // Check for job search-related intent
    if (text.includes('job') || text.includes('apply') || text.includes('application') || 
        text.includes('career') || text.includes('company') || text.includes('opportunity') || 
        text.includes('position') || text.includes('search')) {
      return 'jobSearch';
    }
    
    // Check for general preparation intent
    if (text.includes('prepare') || text.includes('preparation') || text.includes('ready') || 
        text.includes('plan') || text.includes('strategy') || text.includes('approach')) {
      return 'preparation';
    }

    // If repeated question about a company, provide more info
    if (lastQueryIntent && lastQueryIntent !== 'default' && getCompanyMention(text)) {
      return getCompanyMention(text);
    }
    
    // Check if we should maintain the current conversation context based on the last query
    if (lastQueryIntent && lastQueryIntent !== 'default' && lastQueryIntent !== 'hello' && lastQueryIntent !== 'help') {
      // If the message is short and doesn't have clear intent, maintain the previous context
      if (text.split(' ').length < 4 && !isGreeting(text)) {
        return lastQueryIntent;
      }
    }
    
    // If no specific intent is detected
    return 'default';
  };
  
  // Get a response based on detected intent
  const getResponse = (intent, userQuery) => {
    // For capabilities questions
    if (intent === 'capabilities') {
      return KNOWLEDGE_BASE.capabilities[Math.floor(Math.random() * KNOWLEDGE_BASE.capabilities.length)];
    }
    
    // For greetings, return from GREETINGS
    if (intent === 'hello' || intent === 'help') {
      const responses = GREETINGS[intent];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // For questions about specific companies
    if (intent.endsWith('Questions') && KNOWLEDGE_BASE[intent]) {
      return KNOWLEDGE_BASE[intent][Math.floor(Math.random() * KNOWLEDGE_BASE[intent].length)];
    }
    
    // For company-specific and interview questions
    if (userQuery.toLowerCase().includes('interview')) {
      const company = getCompanyMention(userQuery);
      if (company && KNOWLEDGE_BASE[company]) {
        return KNOWLEDGE_BASE[company][Math.floor(Math.random() * KNOWLEDGE_BASE[company].length)];
      }
    }
    
    // For default/unknown intent
    if (intent === 'default') {
      return DEFAULT_RESPONSES[Math.floor(Math.random() * DEFAULT_RESPONSES.length)];
    }
    
    // For known intents, return from knowledge base
    const responses = KNOWLEDGE_BASE[intent];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // Add user message to chat
    const userMessage = { role: 'user', content: message };
    setChatHistory([...chatHistory, userMessage]);
    
    const userQuery = message;
    setMessage('');
    
    // Add typing indicator
    setChatHistory(prev => [...prev, { role: 'assistant', typing: true }]);
    
    // Generate a relevant response
    setTimeout(async () => {
      let intent = detectIntent(userQuery);
      const response = getResponse(intent, userQuery);
      
      // Store the last intent to track conversation context
      setLastQueryIntent(intent);
      
      // Remove typing indicator and add real response
      setChatHistory(prev => 
        prev.filter(msg => !msg.typing).concat([{ 
          role: 'assistant', 
          content: response,
          intent: intent !== 'default' && intent !== 'hello' && intent !== 'help' ? intent : undefined
        }])
      );
    }, 1000);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chatbot dialog */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl w-80 sm:w-96 flex flex-col h-[30rem] border border-gray-200 overflow-hidden">
          {/* Chat header */}
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
            <h3 className="font-semibold">Placement Assistant</h3>
            
            {/* Add prediction icon for students */}
            {user && user.userType === 'student' && (
              <Link to="/#placement-prediction" className="text-white hover:text-blue-100 flex items-center text-sm mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>View Prediction</span>
              </Link>
            )}
            
            <button 
              onClick={toggleChat}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Chat messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            {chatHistory.map((msg, index) => 
              msg.typing ? (
                <div key={index} className="flex justify-start mb-4">
                  <div className="bg-gray-100 text-gray-800 rounded-lg px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-75"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-150"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div 
                  key={index} 
                  className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`px-4 py-2 rounded-lg ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  } max-w-[80%]`}>
                    <p className="whitespace-pre-line">{msg.content}</p>
                    {msg.intent && msg.role === 'assistant' && (
                      <div className="mt-1 text-xs font-medium opacity-70">
                        Topic: {msg.intent}
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Suggestion buttons */}
          {chatHistory.length === 1 && (
            <div className="px-4 py-2 border-t border-gray-200">
              <div className="flex flex-wrap gap-2 mb-2">
                <button 
                  onClick={() => {
                    setMessage("How should I prepare my resume?");
                    document.querySelector('form').dispatchEvent(new Event('submit', {cancelable: true, bubbles: true}));
                  }}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-3 rounded-full transition-colors"
                >
                  Resume tips
                </button>
                <button 
                  onClick={() => {
                    setMessage("How to prepare for interviews?");
                    document.querySelector('form').dispatchEvent(new Event('submit', {cancelable: true, bubbles: true}));
                  }}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-3 rounded-full transition-colors"
                >
                  Interview prep
                </button>
                <button 
                  onClick={() => {
                    setMessage("What skills should I develop?");
                    document.querySelector('form').dispatchEvent(new Event('submit', {cancelable: true, bubbles: true}));
                  }}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-3 rounded-full transition-colors"
                >
                  Skills needed
                </button>
              </div>
            </div>
          )}
          
          {/* Input form */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414-1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Chat toggle button */}
      {!isOpen && (
        <Button
          onClick={toggleChat}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full h-14 w-14 flex items-center justify-center shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </Button>
      )}
      
      {/* Floating prediction icon for students - visible even when chat is closed */}
      {!isOpen && user && user.userType === 'student' && (
        <Link 
          to="/#placement-prediction" 
          className="absolute top-[-50px] right-2 bg-green-100 text-green-800 hover:bg-green-200 px-3 py-2 rounded-full flex items-center text-sm shadow-md transition-all hover:scale-105"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Prediction</span>
        </Link>
      )}
    </div>
  );
};

export default ChatBot; 