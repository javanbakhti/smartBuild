import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Delete } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const OnScreenKeyboard = ({ onKeyPress, onBackspace, onClear, onSubmit, isNumeric = true }) => {
  const { t } = useLanguage();
  const numericKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  const alphaKeys = [
    'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P',
    'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L',
    'Z', 'X', 'C', 'V', 'B', 'N', 'M'
  ];
  const keys = isNumeric ? numericKeys : [...numericKeys, ...alphaKeys];

  const KeyButton = ({ children, onClick, className = '', fullSpan = false }) => (
    <Button
      variant="outline"
      className={`h-16 text-2xl font-semibold bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-colors ${className} ${fullSpan ? 'col-span-full' : ''}`}
      onClick={onClick}
    >
      {children}
    </Button>
  );

  return (
    <div className="grid grid-cols-3 gap-2 p-4 bg-black/30 rounded-lg shadow-xl">
      {keys.slice(0,9).map((key) => (
        <KeyButton key={key} onClick={() => onKeyPress(key)}>
          {key}
        </KeyButton>
      ))}
      <KeyButton onClick={onClear} className="bg-red-500/50 hover:bg-red-600/50">
        <X className="w-7 h-7" />
      </KeyButton>
      <KeyButton onClick={() => onKeyPress(keys[9])}>
        {keys[9]}
      </KeyButton>
      <KeyButton onClick={onBackspace} className="bg-yellow-500/50 hover:bg-yellow-600/50">
        <Delete className="w-7 h-7" />
      </KeyButton>
      <KeyButton onClick={onSubmit} className="col-span-3 bg-green-500/70 hover:bg-green-600/70 text-xl h-20">
        {t('submit')}
      </KeyButton>
    </div>
  );
};

export default OnScreenKeyboard;