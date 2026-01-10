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
}

interface QuestionFlow {
  question: string;
  options: string[];
  key: string;
}

const ProductRecommendationList: React.FC<{
  products: GiftAdvisorProduct[];
  onProductClick: (id: string) => void;
}> = ({ products, onProductClick }) => {
  const [expanded, setExpanded] = useState(false);
  const displayProducts = expanded ? products : products.slice(0, 5);

  const calculateFinalPrice = (product: Product) => {
    if (product.discount && product.discount > 0) {
      return Math.round(product.pdfPrice * (1 - product.discount / 100));
    }
    return product.pdfPrice;
  };

  return (
    <div className="mt-4 space-y-4">
      {displayProducts.map((product) => {
        const finalPrice = calculateFinalPrice(product);
        return (
          <div
            key={product.id}
            onClick={() => onProductClick(product.id)}
            className="bg-white p-3 rounded-xl border border-purple-100 shadow-sm cursor-pointer hover:shadow-xl hover:border-purple-300 transition-all group relative overflow-hidden transform hover:-translate-y-1"
          >
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
    const scoredProducts = filtered.map(p => {
      let score = 0;
      const meta = (p.name + ' ' + p.category + ' ' + p.description).toLowerCase();

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
        if (p.shape === 'HEART' || meta.includes('love')) score -= 10; // Avoid romance items
      }
      if (recipient.includes('Parents') || recipient.includes('Family')) {
        if (meta.includes('frame') || meta.includes('family') || meta.includes('home') || meta.includes('clock') || meta.includes('idol') || meta.includes('god')) score += 10;
      }

      // --- Occasion Scoring ---
      if (occasion.includes('Anniversary') || occasion.includes('Wedding')) {
        if (meta.includes('couple') || meta.includes('wedding') || meta.includes('anniversary')) score += 10;
        if (p.pdfPrice > 1000) score += 5; // Premium for big events
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

      // --- Material Scoring ---
      if (material.includes('Neon')) {
        if (meta.includes('neon') || meta.includes('light') || meta.includes('led') || meta.includes('lamp')) score += 20;
      }
      if (material.includes('Wood')) {
        if (meta.includes('wood') || meta.includes('mdf') || meta.includes('engraving')) score += 20;
      }
      if (material.includes('Crystal')) {
        if (meta.includes('crystal') || meta.includes('glass') || meta.includes('acrylic')) score += 20;
      }
      if (material.includes('Accessories')) {
        if (meta.includes('wallet') || meta.includes('pen') || meta.includes('bottle') || meta.includes('t-shirt') || meta.includes('mug')) score += 20;
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

      return { product: p, score };
    });

    console.log("SCORED PRODUCTS:", scoredProducts.sort((a, b) => b.score - a.score).slice(0, 5));

    // Sort by Score DESC keys
    return scoredProducts
      .sort((a, b) => b.score - a.score)
      .map(item => item.product)
      .slice(0, 20); // Top 20 relevant results

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

    if (currentStep > 0) {
      newAnswers[activeFlow[currentStep - 1].key] = text;
    } else {
      if (mode === 'standard') {
        newAnswers['recipient'] = text;
      } else {
        // For character mode, the first question is at index 0
        newAnswers[activeFlow[0].key] = text;
      }
    }
    setUserAnswers(newAnswers);

    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 800));

    // Check if we have more questions
    // Reuse activeFlow from above scope since it is constant within the render,
    // but wait, activeFlow acts on 'mode' which might not have changed, 
    // BUT 'activeFlow' was declared with 'const' above.
    // Ideally we shouldn't redeclare it.

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

      let finalMessage = "I've analyzed your choices! 🧠✨ Here are the top 5 perfect matches that fit the emotion and style you're looking for! 💝\n\n";

      if (recommendedProducts.length === 0) {
        finalMessage = "I couldn't find an exact 100% match, but these are our absolute bestsellers that people usually love! 🌟";
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
          {/* Premium Header */}
          <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-700 text-white p-3.5 flex justify-between items-center shadow-lg shrink-0">
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
                  <span>Analysing emotions & preferences...</span>
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
              </div>
            )}

            {!loading && currentOptions.includes('Start Over 🔄') && mode === 'standard' && (
              <div className="mt-6 mb-2 text-center animate-fade-in">
                <p className="text-xs text-gray-500 mb-2 font-medium">Still you are confused?</p>
                <button
                  onClick={startCharacterAnalysis}
                  className="text-xs font-bold text-purple-600 hover:text-purple-800 underline decoration-wavy underline-offset-4"
                >
                  Click here for Character Analysis 🧠
                </button>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-2.5 border-t border-purple-100 bg-white flex gap-2 items-center shrink-0">
            <input
              className="flex-1 bg-purple-50 border-transparent focus:bg-white focus:ring-2 focus:ring-purple-300 border rounded-full px-4 py-2 text-xs focus:outline-none transition-all placeholder-gray-400"
              placeholder="Type your answer..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              autoFocus
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-2 rounded-full hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-md"
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