import React from 'react';
import { Leaf } from 'lucide-react';

export const FloatingLeaves: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="leaf absolute"
          style={{
            left: `${10 + i * 16}%`,
            animationDelay: `${i * 2}s`,
          }}
        >
          <Leaf
            className="text-[#2D5016]"
            size={24 + Math.random() * 12}
            style={{
              transform: `rotate(${Math.random() * 360}deg)`,
              opacity: 0.06
            }}
          />
        </div>
      ))}
    </div>
  );
};
