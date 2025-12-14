import React from 'react';
import { Leaf } from 'lucide-react';

export const FloatingLeaves: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="leaf absolute"
          style={{
            left: `${5 + i * 12}%`,
            animationDelay: `${i * 1.8}s`,
          }}
        >
          <Leaf
            className="text-[#10B981]"
            size={20 + Math.random() * 20}
            style={{
              transform: `rotate(${Math.random() * 360}deg)`,
              opacity: 0.08 + Math.random() * 0.07
            }}
          />
        </div>
      ))}
    </div>
  );
};
