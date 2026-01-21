import React, { useState, useRef, useEffect } from 'react';
import { Gift, Send, X, Loader2, Sparkles, RefreshCw, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context';
import { Product } from '../types';

interface GiftAdvisorProduct extends Product {
  matchScore?: number;
  matchReason?: string;
}

interface Message {
  role: 'user' | 'bot';
  text: string;
  products?: GiftAdvisorProduct[];
  showRank?: boolean;
}

interface QuestionFlow {
  question: string;
  options: string[];
  key: string;
}

const ProductRecommendationList: React.FC<{
  products: GiftAdvisorProduct[];
  onProductClick: (id: string) => void;
  showRank?: boolean;
}> = ({ products, onProductClick, showRank }) => {
  const [expanded, setExpanded] = useState(false);
  const displayProducts = expanded ? products : products.slice(0, 5);

  const calculateFinalPrice = (product: Product) => {
    if (product.discount && product.discount > 0) {
      return Math.round(product.pdfPrice * (1 - product.discount / 100));
    }
    return product.pdfPrice;
  };

  const getRankBadge = (index: number) => {
    const rank = index + 1;
    let colorClass = "bg-gray-800 text-white";
    let icon = `#${rank}`;

    if (rank === 1) { colorClass = "bg-yellow-400 text-yellow-900 border-yellow-200"; icon = "🥇 #1"; }
    else if (rank === 2) { colorClass = "bg-gray-300 text-gray-800 border-gray-400"; icon = "🥈 #2"; }
    else if (rank === 3) { colorClass = "bg-orange-300 text-orange-900 border-orange-400"; icon = "🥉 #3"; }

    return (
      <div className={`absolute top-0 left-0 ${colorClass} border-b border-r text-[10px] font-bold px-2.5 py-1 rounded-br-lg z-20 shadow-sm flex items-center justify-center min-w-[35px]`}>
        {icon}
      </div>
    );
  };

  return (
    <div className="mt-4 space-y-4">
      {displayProducts.map((product, index) => {
        const finalPrice = calculateFinalPrice(product);
        return (
          <div
            key={product.id}
            onClick={() => onProductClick(product.id)}
            className="bg-white p-3 rounded-xl border border-purple-100 shadow-sm cursor-pointer hover:shadow-xl hover:border-purple-300 transition-all group relative overflow-hidden transform hover:-translate-y-1"
          >
            {showRank && getRankBadge(index)}
            {/* Match Badge */}
            {product.matchScore && product.matchScore > 30 && (
              <div className="absolute top-0 right-0 bg-green-500 text-white text-[9px] font-bold px-2 py-1 rounded-bl-lg z-10 shadow-sm flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Perfect Match
              </div>
            )}

            <div className="flex gap-3">
              <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-gray-100 relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-black text-gray-900 leading-tight line-clamp-2 mb-1 group-hover:text-purple-700 transition-colors">
                    {product.name}
                  </h4>
                  {product.matchReason && (
                    <p className="text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded inline-block font-medium mb-1">
                      💡 {product.matchReason}
                    </p>
                  )}
                </div>

                <div className="flex items-end justify-between mt-1">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-900">₹{finalPrice}</span>
                    {product.discount && product.discount > 0 && (
                      <span className="text-[9px] text-gray-400 line-through">₹{product.pdfPrice}</span>
                    )}
                  </div>
                  <div className="bg-gray-900 text-white px-2 py-1 rounded-lg text-[10px] font-bold group-hover:bg-purple-600 transition-colors flex items-center gap-1">
                    View <ArrowRight className="w-2.5 h-2.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {!expanded && products.length > 5 && (
        <button
          onClick={() => setExpanded(true)}
          className="w-full py-2 bg-purple-50 text-purple-700 font-bold text-xs rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-center gap-1 border border-purple-200"
        >
          Show More Matches ({products.length - 5}) <ArrowRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};


export const GiftAdvisor: React.FC = () => {
  const navigate = useNavigate();
  const { isGiftAdvisorOpen, setIsGiftAdvisorOpen, products: dbProducts } = useCart();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      text: "Hello! 👋 I'm your Gift Genie 🧞‍♂️\n\nI'm designed to find the *perfect* emotional match! ✨\n\nFirst, who is this special gift for? 🎁"
    }
  ]);
  // ... inside GiftAdvisor component

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentOptions, setCurrentOptions] = useState<string[]>([
    "Partner/Soulmate ❤️",
    "Parents/Family 👨‍👩‍👧",
    "Best Friend 👯‍♀️",
    "Colleague/Boss 👔"
  ]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [mode, setMode] = useState<'standard' | 'character'>('standard');
  const scrollRef = useRef<HTMLDivElement>(null);

  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const questionFlow: QuestionFlow[] = [
    {
      question: "How wonderful! 🌟 What are we celebrating today? 🥳",
      options: [
        "Birthday Bash 🎂",
        "Anniversary / Wedding 💍",
        "House Warming 🏡",
        "Just a Sweet Surprise 🎁"
      ],
      key: 'occasion'
    },
    {
      question: "Got it! 💰 What’s your comfortable budget range? 🏷️",
      options: [
        "Pocket Friendly (Under ₹500) 🐣",
        "Sweet Spot (₹500 - ₹1500) 🍬",
        "Premium (₹1500 - ₹3000) 💎",
        "Luxury (Above ₹3000) 👑"
      ],
      key: 'budget'
    },
    {
      question: "What's their personality vibe usually? 😎",
      options: [
        "Emotional & Sentimental 🥺",
        "Fun & Quirky 🤪",
        "Classy & Professional 🕴️",
        "Trendy & Aesthetic 💅"
      ],
      key: 'vibe'
    },
    {
      question: "What do you want to customize on the gift? 🖌️",
      options: [
        "A Memorable Photo 📸",
        "Their Name/Initials 🔤",
        "A Heartfelt Message 📝",
        "No Customization Needed 🚫"
      ],
      key: 'content'
    },
    {
      question: "Final Question! 🏁 What material or finish looks best? ✨",
      options: [
        "Glowing Neon/LED 💡",
        "Premium Wood/MDF 🪵",
        "3D Crystal/Glass 💎",
        "Daily Use Accessories 🎒"
      ],
      key: 'material'
    }
  ];

  const characterQuestions: QuestionFlow[] = [
    {
      question: "Let's dig deeper! 🕵️‍♂️ What's their perfect weekend vibe? 🌴",
      options: [
        "Netflix & Chill 📺",
        "Party & Socializing 🥂",
        "Reading & Relaxing 📚",
        "Adventure & Travel ✈️"
      ],
      key: 'char_weekend'
    },
    {
      question: "What's their style statement? 👗",
      options: [
        "Bold & Flashy ✨",
        "Simple & Elegant 🌿",
        "Sentimental & Deep 💖",
        "Professional & Sharp 👔"
      ],
      key: 'char_style'
    },
    {
      question: "Last one! Pick a color palette they'd love 🎨",
      options: [
        "Warm (Red/Gold/Wood) 🔥",
        "Cool (Blue/Purple/Neon) 🌊",
        "Monochrome (B&W/Classy) 🏁",
        "Vibrant & Colorful 🌈"
      ],
      key: 'char_color'
    }
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const generateFriendlyResponse = (topProduct: GiftAdvisorProduct | undefined, answers: Record<string, string>) => {
    const emojis = ['✨', '🎉', '🎁', '💝', '🤩', '💫'];
    const randomEmoji = () => emojis[Math.floor(Math.random() * emojis.length)];

    if (!topProduct) {
      return `I couldn't find an exact match for "${answers.material || 'your request'}", but here are some of our most loved gifts! ${randomEmoji()}`;
    }

    const keyword = answers.material || answers.content || 'your preference';

    // Simulating a "Chatbot" thought process
    const starters = [
      `Ooh, I love that choice! ${randomEmoji()}`,
      `Great taste! ${randomEmoji()}`,
      `I've got just the thing! ${randomEmoji()}`,
      `You asked for ${keyword}, and I found some gems! ${randomEmoji()}`
    ];

    const start = starters[Math.floor(Math.random() * starters.length)];

    return `${start} Based on your answers, these **${topProduct.category || 'gifts'}** are a perfect match. I think you'll love the **${topProduct.name}**! 👇`;
  };

  const filterProducts = (answers: Record<string, string>): GiftAdvisorProduct[] => {
    let filtered = [...dbProducts];

    // 1. Strict Filter by Budget
    if (answers.budget) {
      if (answers.budget.includes('Under ₹500')) {
        filtered = filtered.filter(p => p.pdfPrice < 500);
      } else if (answers.budget.includes('₹500 - ₹1500')) {
        filtered = filtered.filter(p => p.pdfPrice >= 500 && p.pdfPrice <= 1500);
      } else if (answers.budget.includes('₹1500 - ₹3000')) {
        filtered = filtered.filter(p => p.pdfPrice >= 1500 && p.pdfPrice <= 3000);
      } else if (answers.budget.includes('Above ₹3000')) {
        filtered = filtered.filter(p => p.pdfPrice > 3000);
      }
    }

    // 2. Scoring System

    // Define synonyms for smarter matching
    const synonymMap: Record<string, string[]> = {
      'photo': ['pic', 'image', 'picture', 'selfie', 'portrait'],
      'frame': ['border', 'stand'],
      'crystal': ['glass', 'cube', 'block', 'diamond'],
      'neon': ['light', 'lamp', 'sign', 'glow', 'led'],
      'wood': ['wooden', 'plank', 'mdf', 'slice'],
      'accessories': ['wallet', 'pen', 'bottle', 'mug', 'cup', 'keychain', 'diary'],
      'bottle': ['flask', 'sipper'],
      'mug': ['cup', 'coffee'],
    };

    const normalizeText = (text: string) => {
      let normalized = text.toLowerCase();
      Object.keys(synonymMap).forEach(key => {
        synonymMap[key].forEach(syn => {
          // Replace whole words only
          const regex = new RegExp(`\\b${syn}\\b`, 'g');
          normalized = normalized.replace(regex, key);
        });
      });
      return normalized;
    };

    const scoredProducts = filtered.map(p => {
      let score = 0;
      let matchReason = '';
      const meta = (p.name + ' ' + p.category + ' ' + p.description + ' ' + p.shape).toLowerCase();
      const normalizedMeta = normalizeText(meta);

      // --- Direct Keyword Matching (Vital for "Type your own") ---
      Object.keys(answers).forEach(key => {
        const ans = answers[key];
        if (!ans) return;

        // Clean and Normalize
        const rawAns = ans.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '').trim();
        if (!rawAns || rawAns.length < 2) return;

        const normalizedAns = normalizeText(rawAns);

        // 1. Exact Phrase Match (Highest Priority)
        if (meta.includes(normalizedAns) || normalizedMeta.includes(normalizedAns)) {
          score += 300; // MASSIVE BOOST
          if (!matchReason) matchReason = `Exact match for "${rawAns}"`;
        }
        // 2. Smart Token Match
        else {
          const userTokens = normalizedAns.split(/\s+/).map(w => w.replace(/s$/, '')).filter(w => w.length > 2);
          const productTokens = normalizedMeta.split(/\s+/).map(w => w.replace(/s$/, ''));

          const matchCount = userTokens.reduce((acc, token) => {
            return acc + (productTokens.includes(token) ? 1 : 0);
          }, 0);

          if (matchCount > 0) {
            score += matchCount * 100; // High confidence token match
            if (!matchReason) matchReason = `Matches "${rawAns}"`;
          }

          // 3. Fallback Meta Match
          if (normalizedMeta.includes(normalizedAns)) {
            score += 40;
          }
        }
      });

      const recipient = answers.recipient || '';
      const occasion = answers.occasion || '';
      const vibe = answers.vibe || '';
      const content = answers.content || '';
      const material = answers.material || '';

      // --- Recipient Scoring ---
      if (recipient.includes('Partner') || recipient.includes('Soulmate')) {
        if (p.shape === 'HEART' || meta.includes('love') || meta.includes('couple') || meta.includes('rose') || meta.includes('wedding')) score += 15;
      }
      if (recipient.includes('Colleague') || recipient.includes('Boss')) {
        if (meta.includes('pen') || meta.includes('diary') || meta.includes('wallet') || meta.includes('bottle') || meta.includes('organizer')) score += 15;
        if (p.shape === 'HEART' || meta.includes('love')) score -= 10;
      }
      if (recipient.includes('Parents') || recipient.includes('Family')) {
        if (meta.includes('frame') || meta.includes('family') || meta.includes('home') || meta.includes('clock') || meta.includes('idol') || meta.includes('god')) score += 10;
      }

      // --- Occasion Scoring ---
      if (occasion.includes('Anniversary') || occasion.includes('Wedding')) {
        if (meta.includes('couple') || meta.includes('wedding') || meta.includes('anniversary')) score += 10;
        if (p.pdfPrice > 1000) score += 5;
      }
      if (occasion.includes('House')) { // Housewarming
        if (meta.includes('frame') || meta.includes('clock') || meta.includes('plate') || meta.includes('wall')) score += 15;
      }

      // --- Vibe Scoring ---
      if (vibe.includes('Emotional')) {
        if (meta.includes('photo') || meta.includes('crystal') || meta.includes('memory') || meta.includes('frame')) score += 10;
      }
      if (vibe.includes('Fun')) {
        if (meta.includes('caricature') || meta.includes('bobblehead') || meta.includes('idol') || meta.includes('comic')) score += 15;
      }
      if (vibe.includes('Classy') || vibe.includes('Professional')) {
        if (meta.includes('crystal') || meta.includes('pen') || meta.includes('glass') || meta.includes('leather')) score += 10;
      }
      if (vibe.includes('Trendy')) {
        if (meta.includes('neon') || meta.includes('led') || meta.includes('aesthetic') || meta.includes('lamp')) score += 15;
      }

      // --- Content (Customization) Scoring ---
      if (content.includes('Photo')) {
        if (meta.includes('frame') || meta.includes('crystal') || meta.includes('cut') || p.allowsExtraHeads) score += 20;
      }
      if (content.includes('Name')) {
        if (meta.includes('wallet') || meta.includes('pen') || meta.includes('bottle') || meta.includes('keychain') || meta.includes('neon')) score += 15;
      }
      if (content.includes('Message')) {
        if (meta.includes('plaque') || meta.includes('trophy') || meta.includes('crystal') || meta.includes('wood')) score += 10;
      }

      // --- Material/Category Scoring (Strict Enforcement) ---
      // We are boosting the weight here significantly to ensure the user's material choice is respected
      if (material.includes('Neon') || normalizeText(material).includes('neon')) {
        if (meta.includes('neon') || meta.includes('light') || meta.includes('led') || meta.includes('lamp')) score += 150;
        else score -= 100; // Stricter penalty
      }
      if (material.includes('Wood') || normalizeText(material).includes('wood')) {
        if (meta.includes('wood') || meta.includes('mdf') || meta.includes('engraving')) score += 150;
        else score -= 100;
      }
      if (material.includes('Crystal') || normalizeText(material).includes('crystal')) {
        if (meta.includes('crystal') || meta.includes('glass') || meta.includes('acrylic')) score += 150;
        else score -= 100;
      }
      if (material.includes('Accessories') || normalizeText(material).includes('accessories')) {
        // Broad list of accessories
        if (meta.includes('wallet') || meta.includes('pen') || meta.includes('bottle') ||
          meta.includes('t-shirt') || meta.includes('mug') || meta.includes('keychain') ||
          meta.includes('diary') || meta.includes('clock') || meta.includes('stand')) {
          score += 150;
        } else {
          score -= 100;
        }
      }

      // --- Character Analysis Scoring (Higher weight for exact matches) ---
      const charWeekend = answers.char_weekend || '';
      const charStyle = answers.char_style || '';
      const charColor = answers.char_color || '';

      if (charWeekend) {
        if (charWeekend.includes('Netflix')) if (meta.includes('lamp') || meta.includes('pillow') || meta.includes('light') || meta.includes('decor')) score += 25;
        if (charWeekend.includes('Party')) if (meta.includes('neon') || meta.includes('bar') || meta.includes('shot') || meta.includes('glass')) score += 25;
        if (charWeekend.includes('Reading')) if (meta.includes('wood') || meta.includes('organizer') || meta.includes('desk') || meta.includes('lamp')) score += 25;
        if (charWeekend.includes('Adventure')) if (meta.includes('wallet') || meta.includes('keychain') || meta.includes('car') || meta.includes('bottle')) score += 25;
      }

      if (charStyle) {
        if (charStyle.includes('Bold')) if (meta.includes('neon') || meta.includes('3d') || meta.includes('led')) score += 25;
        if (charStyle.includes('Simple')) if (meta.includes('wood') || meta.includes('frame') || meta.includes('minimal')) score += 25;
        if (charStyle.includes('Sentimental')) if (meta.includes('photo') || meta.includes('memory') || meta.includes('love') || meta.includes('heart')) score += 25;
        if (charStyle.includes('Professional')) if (meta.includes('pen') || meta.includes('diary') || meta.includes('office') || meta.includes('desk')) score += 25;
      }

      if (charColor) {
        if (charColor.includes('Warm')) if (meta.includes('wood') || meta.includes('warm') || meta.includes('yellow') || meta.includes('gold')) score += 20;
        if (charColor.includes('Cool')) if (meta.includes('blue') || meta.includes('neon') || meta.includes('acrylic') || meta.includes('silver')) score += 20;
        if (charColor.includes('Monochrome')) if (meta.includes('engraving') || meta.includes('sketch') || meta.includes('shadow') || meta.includes('black')) score += 20;
        if (charColor.includes('Vibrant')) if (meta.includes('color') || meta.includes('mosaic') || meta.includes('print') || meta.includes('led')) score += 20;
      }

      // Base Popularity Boost (Small factor to break ties)
      score += (p.rating || 0) * 0.5;

      return { ...p, matchReason, matchScore: score }; // Return enriched product
    });

    // Detect if we have strong matches
    const hasStrongMatches = scoredProducts.some(p => (p.matchScore || 0) > 100);

    // Final Sort & Filter
    return scoredProducts
      .filter(p => {
        // If we have strong matches, filter out items that have 0 or negative score to keep it clean
        if (hasStrongMatches) return (p.matchScore || 0) > 0;
        return true; // standard fallback
      })
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
      .slice(0, 20); // Top 20 relevant results
  };

  const saveGiftGenieData = async (answers: Record<string, string>, recommended: GiftAdvisorProduct[]) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/gift-genie`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          recommendedProducts: recommended.map(p => p.id)
        })
      });
    } catch (err) {
      console.error("Failed to save Gift Genie data", err);
    }
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);
    setCurrentOptions([]);

    // Store the answer
    const newAnswers = { ...userAnswers };
    const activeFlow = mode === 'standard' ? questionFlow : characterQuestions;

    if (currentStep === 0 && mode === 'standard') {
      newAnswers['recipient'] = text;
    } else if (currentStep > 0 && currentStep <= activeFlow.length) {
      // currentStep is 1-based index regarding flow array if we consider initial state 0 (recipient Q)
      // But wait:
      // Initial state: currentStep = 0. Shows "Who is this for?"
      // On answer: sets recipient. Checks if currentStep < activeFlow.length.
      // The flow array `questionFlow` starts with Occasion question.

      // Current implementation login in handleSend:
      // if (currentStep > 0) newAnswers[activeFlow[currentStep - 1].key] = text;
      // else { ... recipient ... }

      if (currentStep > 0) {
        newAnswers[activeFlow[currentStep - 1].key] = text;
      } else {
        if (mode === 'standard') {
          newAnswers['recipient'] = text;
        } else {
          newAnswers[activeFlow[0].key] = text;
        }
      }
    }
    setUserAnswers(newAnswers);

    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 800));

    if (currentStep < activeFlow.length) {
      const nextQuestion = activeFlow[currentStep];
      setMessages(prev => [...prev, {
        role: 'bot',
        text: nextQuestion.question
      }]);
      setCurrentOptions(nextQuestion.options);
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - show products
      const recommendedProducts = filterProducts(newAnswers);

      // SAVE DATA TO DB
      saveGiftGenieData(newAnswers, recommendedProducts);


      // Generate friendly chatbot response
      const responseText = generateFriendlyResponse(recommendedProducts[0], newAnswers);

      let finalMessage = responseText;

      if (recommendedProducts.length === 0) {
        finalMessage = "I couldn't find an exact 100% match for what you typed, but these are our absolute bestsellers that people usually love! 🌟";
        // Show top rated products as fallback
        const fallbackProducts = [...dbProducts]
          .filter(p => !newAnswers.budget || (newAnswers.budget.includes('Under') ? p.pdfPrice < 1000 : true)) // Light fallback filtering
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 5);

        setMessages(prev => [...prev, {
          role: 'bot',
          text: finalMessage,
          products: fallbackProducts
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'bot',
          text: finalMessage,
          products: recommendedProducts
        }]);
      }

      setCurrentOptions(['Start Over 🔄', 'Browse All Gifts 🛍️']);
    }

    setLoading(false);
  };

  const handleOptionClick = (option: string) => {
    if (option === 'Start Over 🔄') {
      handleRestart();
    } else if (option === 'Browse All Gifts 🛍️') {
      navigate('/products');
      setIsGiftAdvisorOpen(false);
    } else {
      handleSend(option);
    }
  };

  // State to track if top recs have been shown
  const [hasShownTopRecs, setHasShownTopRecs] = useState(false);

  const handleRestart = () => {
    setMessages([{
      role: 'bot',
      text: "Hello! 👋 I'm your Gift Genie 🧞‍♂️\n\nI'm designed to find the *perfect* emotional match! ✨\n\nFirst, who is this special gift for? 🎁"
    }]);
    setCurrentOptions([
      "Partner/Soulmate ❤️",
      "Parents/Family 👨‍👩‍👧",
      "Best Friend 👯‍♀️",
      "Colleague/Boss 👔"
    ]);
    setUserAnswers({});
    setCurrentStep(0);
    setMode('standard');
    setHasShownTopRecs(false); // Reset this
  };

  const startCharacterAnalysis = () => {
    setMode('character');
    setUserAnswers({}); // Clear previous context to focus on character
    setCurrentStep(1); // Start at step 1 (first question index + 1 for next iter, but here we set up first Q immediately)

    const firstQuestion = characterQuestions[0];

    setMessages(prev => [
      ...prev,
      {
        role: 'bot',
        text: firstQuestion.question
      }
    ]);
    setCurrentOptions(firstQuestion.options);
  };

  const handleTopRecommendations = () => {
    // 1. Re-run scoring based on User Answers (Gift Genie Logic)
    // 2. Take TOP 5 strictly
    const recs = filterProducts(userAnswers).slice(0, 5);

    setHasShownTopRecs(true); // Hide the button

    setMessages(prev => [
      ...prev,
      {
        role: 'bot',
        text: "I've drilled down to the absolute best matches based on your unique choices! 🎯\n\nHere are the **Top 5 Winners** ranked just for you! 🏆👇",
        products: recs,
        showRank: true
      },
      {
        role: 'bot',
        text: "✨ These are the best matches based on your choices.\nFeel free to start over or browse all gifts anytime. 😊"
      }
    ]);
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
    if (window.innerWidth < 640) {
      setIsGiftAdvisorOpen(false);
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col items-end font-sans">
      {isGiftAdvisorOpen && (
        <div className="bg-white w-72 sm:w-80 h-[450px] rounded-2xl shadow-2xl flex flex-col border border-gray-100 overflow-hidden mb-3 animate-scale-up origin-bottom-right ring-1 ring-black/5">
          {/* Premium Header - kept same */}
          <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-700 text-white p-3.5 flex justify-between items-center shadow-lg shrink-0">
            {/* ... Header content ... */}
            <div className="flex items-center gap-2.5">
              <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm shadow-inner animate-pulse">
                <Sparkles className="h-4 w-4 text-yellow-300" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide text-white">Gift Genie 🧞‍♂️</h3>
                <p className="text-[10px] text-purple-100 font-medium">Your Personal Gift Finder</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleRestart}
                title="Start Over"
                className="hover:bg-white/20 p-1.5 rounded-full transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsGiftAdvisorOpen(false)}
                className="hover:bg-white/20 p-1.5 rounded-full transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Chat Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-gradient-to-b from-purple-50/30 to-pink-50/30 custom-scrollbar">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm mr-2 shrink-0 shadow-md mt-1">
                    🧞‍♂️
                  </div>
                )}
                <div className={`max-w-[85%] ${m.role === 'user' ? '' : 'flex-1'}`}>
                  {/* Message Bubble */}
                  <div className={`p-3 rounded-2xl text-[12px] shadow-sm leading-relaxed ${m.role === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 border border-purple-100 rounded-tl-sm'
                    }`}>
                    <span className="whitespace-pre-wrap">{m.text}</span>
                  </div>

                  {/* Product Cards */}
                  {m.products && m.products.length > 0 && (
                    <ProductRecommendationList
                      products={m.products}
                      onProductClick={handleProductClick}
                      showRank={m.showRank}
                    />
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm shadow-md animate-pulse">
                  🧞‍♂️
                </div>
                <div className="bg-white border border-purple-100 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2.5 text-xs text-purple-800 font-medium shadow-sm">
                  <Loader2 className="animate-spin h-3.5 w-3.5" />
                  <span>Analysing emotions...</span>
                </div>
              </div>
            )}

            {!loading && currentOptions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 animate-fade-in pl-9">
                {currentOptions.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleOptionClick(opt)}
                    className="bg-white border text-left border-purple-200 text-purple-900 text-[11px] font-semibold px-4 py-2.5 rounded-xl hover:bg-purple-600 hover:text-white hover:border-purple-600 hover:shadow-lg transition-all active:scale-95 shadow-sm transform hover:-translate-y-0.5 duration-200"
                  >
                    {opt}
                  </button>
                ))}

                {/* Type your own option */}
                {!currentOptions.includes('Start Over 🔄') && (
                  <button
                    onClick={() => {
                      if (inputRef.current) {
                        inputRef.current.focus();
                        setIsTyping(true);
                      }
                    }}
                    className="bg-white border text-left border-dashed border-purple-300 text-purple-600 text-[11px] font-semibold px-4 py-2.5 rounded-xl hover:bg-purple-50 hover:border-purple-400 transition-all active:scale-95 shadow-sm transform hover:-translate-y-0.5 duration-200 flex items-center gap-1 group"
                  >
                    <span className="group-hover:scale-110 transition-transform">✍️</span> Type your own...
                  </button>
                )}
              </div>
            )}

            {!loading && currentOptions.includes('Start Over 🔄') && mode === 'standard' && (
              <div className="mt-6 mb-2 text-center animate-fade-in">
                <p className="text-xs text-gray-500 mb-2 font-medium">Still confused about what to gift? 🎁</p>
                <button
                  onClick={startCharacterAnalysis}
                  className="text-xs font-bold text-purple-600 hover:text-purple-800 underline decoration-wavy underline-offset-4 flex items-center justify-center gap-1 mx-auto"
                >
                  👉 Let me help you choose 🎁
                </button>
              </div>
            )}

            {!loading && currentOptions.includes('Start Over 🔄') && mode === 'character' && !hasShownTopRecs && (
              <div className="mt-6 mb-2 text-center animate-fade-in">
                <p className="text-xs text-gray-500 mb-2 font-medium">Still confused what to buy? 🤔</p>
                <button
                  onClick={handleTopRecommendations}
                  className="text-xs font-bold text-pink-600 hover:text-pink-800 underline decoration-wavy underline-offset-4 flex items-center justify-center gap-1 mx-auto"
                >
                  Our top recommendations for you 🏆
                </button>
              </div>
            )}
          </div>

          {/* Enhanced Input Area */}
          <div className={`p-3 border-t border-purple-100 bg-white flex gap-2 items-center shrink-0 transition-colors duration-300 ${isTyping ? 'bg-purple-50/30' : ''}`}>
            <div className="relative flex-1 group">
              <div className={`absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full opacity-20 group-hover:opacity-40 transition duration-500 blur ${isTyping ? 'opacity-50' : ''}`}></div>
              <input
                ref={inputRef}
                className={`relative w-full bg-white border-transparent focus:ring-0 rounded-full px-4 py-2.5 text-xs text-gray-800 placeholder-gray-400 shadow-sm transition-all outline-none ${isTyping ? 'ring-2 ring-purple-200' : ''}`}
                placeholder="Type your answer or select an option..."
                value={input}
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
            </div>
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-2.5 rounded-full hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {!isGiftAdvisorOpen && (
        <button
          onClick={() => setIsGiftAdvisorOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-4 rounded-full shadow-2xl transition-all transform hover:scale-110 hover:-translate-y-1 flex items-center justify-center group relative ring-4 ring-purple-200"
        >
          <Gift className="h-6 w-6 text-yellow-300 animate-bounce-slow" />
          <span className="absolute right-0 top-0 -mt-1 -mr-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500 border-2 border-white"></span>
          </span>
          <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-[11px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-gray-700">
            Need Gift Ideas? 🎁
            <span className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-gray-900 transform rotate-45 border-t border-r border-gray-700"></span>
          </span>
        </button>
      )}
    </div>
  );
};