import React, { useState, useRef, useEffect } from 'react';
import { Gift, Send, X, Loader2, Sparkles, RefreshCw, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context';
import { Product } from '../types';

interface Message {
  role: 'user' | 'bot';
  text: string;
  products?: Product[];
}

interface QuestionFlow {
  question: string;
  options: string[];
  key: string;
}

export const GiftAdvisor: React.FC = () => {
  const navigate = useNavigate();
  const { isGiftAdvisorOpen, setIsGiftAdvisorOpen, products: dbProducts } = useCart();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      text: "Hey there! 👋 I'm your Gift Genie 🧞‍♂️\n\nI'm here to help you find the perfect gift! ✨\n\nTell me, who's the lucky person you're shopping for today? 🎁"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentOptions, setCurrentOptions] = useState<string[]>([
    "My Friend 👫",
    "My Partner ❤️",
    "Family Member 👨‍👩‍👧",
    "Colleague 💼"
  ]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const questionFlow: QuestionFlow[] = [
    {
      question: "Awesome! 😊 What's the special occasion? 🎉",
      options: [
        "Birthday 🎂",
        "Anniversary 💝",
        "Wedding 💒",
        "Just Because 💫"
      ],
      key: 'occasion'
    },
    {
      question: "Perfect! 🌟 What's your budget range? 💰",
      options: [
        "Under ₹500 💵",
        "₹500 - ₹1500 💳",
        "₹1500 - ₹3000 💎",
        "Above ₹3000 👑"
      ],
      key: 'budget'
    },
    {
      question: "Great choice! 👍 What kind of gift are they into? 🤔",
      options: [
        "Personalized Items 🎨",
        "Home Decor 🏠",
        "Accessories 💍",
        "Tech & Gadgets 📱"
      ],
      key: 'category'
    }
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const filterProducts = (answers: Record<string, string>): Product[] => {
    let filtered = [...dbProducts];

    // Filter by budget
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

    // Filter by category preference
    if (answers.category) {
      if (answers.category.includes('Personalized')) {
        filtered = filtered.filter(p =>
          p.category.toLowerCase().includes('crystal') ||
          p.category.toLowerCase().includes('engraving') ||
          p.category.toLowerCase().includes('photo')
        );
      } else if (answers.category.includes('Home Decor')) {
        filtered = filtered.filter(p =>
          p.category.toLowerCase().includes('frame') ||
          p.category.toLowerCase().includes('lamp') ||
          p.category.toLowerCase().includes('clock')
        );
      } else if (answers.category.includes('Accessories')) {
        filtered = filtered.filter(p =>
          p.category.toLowerCase().includes('wallet') ||
          p.category.toLowerCase().includes('keychain') ||
          p.category.toLowerCase().includes('bottle')
        );
      }
    }

    // Sort by rating and return top 5
    return filtered
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 5);
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);
    setCurrentOptions([]);

    // Store the answer
    const newAnswers = { ...userAnswers };
    if (currentStep > 0) {
      newAnswers[questionFlow[currentStep - 1].key] = text;
    } else {
      newAnswers['recipient'] = text;
    }
    setUserAnswers(newAnswers);

    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 800));

    // Check if we have more questions
    if (currentStep < questionFlow.length) {
      const nextQuestion = questionFlow[currentStep];
      setMessages(prev => [...prev, {
        role: 'bot',
        text: nextQuestion.question
      }]);
      setCurrentOptions(nextQuestion.options);
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - show products
      const recommendedProducts = filterProducts(newAnswers);

      let finalMessage = "Perfect! 🎯 Based on what you told me, here are some amazing gifts I think they'll absolutely love! 💝\n\n";

      if (recommendedProducts.length === 0) {
        finalMessage = "Hmm... 🤔 I couldn't find exact matches, but here are some popular gifts that everyone loves! 🌟";
        // Show top rated products as fallback
        const fallbackProducts = [...dbProducts]
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
      navigate('/shop');
      setIsGiftAdvisorOpen(false);
    } else {
      handleSend(option);
    }
  };

  const handleRestart = () => {
    setMessages([{
      role: 'bot',
      text: "Hey there! 👋 I'm your Gift Genie 🧞‍♂️\n\nI'm here to help you find the perfect gift! ✨\n\nTell me, who's the lucky person you're shopping for today? 🎁"
    }]);
    setCurrentOptions([
      "My Friend 👫",
      "My Partner ❤️",
      "Family Member 👨‍👩‍👧",
      "Colleague 💼"
    ]);
    setUserAnswers({});
    setCurrentStep(0);
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
    if (window.innerWidth < 640) {
      setIsGiftAdvisorOpen(false);
    }
  };

  const calculateFinalPrice = (product: Product) => {
    if (product.discount && product.discount > 0) {
      return Math.round(product.pdfPrice * (1 - product.discount / 100));
    }
    return product.pdfPrice;
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
                    <div className="mt-3 space-y-2">
                      {m.products.map((product) => {
                        const finalPrice = calculateFinalPrice(product);
                        return (
                          <div
                            key={product.id}
                            onClick={() => handleProductClick(product.id)}
                            className="flex items-center gap-3 bg-white p-3 rounded-xl border border-purple-200 shadow-sm cursor-pointer hover:shadow-lg hover:border-purple-400 transition-all group"
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-16 h-16 rounded-lg object-cover bg-gray-100 border border-gray-200"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-900 truncate group-hover:text-purple-600">
                                {product.name}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-sm font-bold text-purple-600">₹{finalPrice}</p>
                                {product.discount && product.discount > 0 && (
                                  <>
                                    <p className="text-[10px] text-gray-400 line-through">₹{product.pdfPrice}</p>
                                    <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">
                                      {product.discount}% OFF
                                    </span>
                                  </>
                                )}
                              </div>
                              {product.rating && product.rating > 0 && (
                                <div className="flex items-center gap-1 mt-1">
                                  <span className="text-yellow-500 text-[10px]">⭐</span>
                                  <span className="text-[10px] text-gray-600 font-medium">
                                    {product.rating} ({product.reviewsCount || 0})
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="bg-purple-100 p-2 rounded-full text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                              <ArrowRight className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm shadow-md">
                  🧞‍♂️
                </div>
                <div className="bg-white border border-purple-100 px-3 py-2 rounded-2xl rounded-tl-sm flex items-center gap-2 text-[11px] text-gray-600 shadow-sm">
                  <Loader2 className="animate-spin h-3 w-3 text-purple-600" />
                  <span>Finding perfect gifts...</span>
                </div>
              </div>
            )}

            {!loading && currentOptions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 animate-fade-in">
                {currentOptions.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleOptionClick(opt)}
                    className="bg-white border-2 border-purple-200 text-purple-700 text-[11px] font-semibold px-3 py-2 rounded-full hover:bg-purple-50 hover:border-purple-400 hover:shadow-md transition-all active:scale-95"
                  >
                    {opt}
                  </button>
                ))}
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