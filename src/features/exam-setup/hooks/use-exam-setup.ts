import { useState, useCallback } from 'react';
import { ExamConfig, AnswerType, AnswerKey } from '../types';
import { autoDetectType, parseMCQAnswers, parseShortAnswers, parseTrueFalseAnswers, validateAnswerKey } from '../utils/answer-parser';

export function useExamSetup() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [examConfig, setExamConfig] = useState<Partial<ExamConfig>>({
    title: '',
    durationMinutes: 45,
    answerType: 'mcq'
  });
  const [pdfFile, setPdfFileState] = useState<File | null>(null);
  const [answerInput, setAnswerInputState] = useState('');
  const [parsedAnswers, setParsedAnswers] = useState<AnswerKey[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);

  const setPdfFile = (file: File | null) => setPdfFileState(file);
  
  const setDuration = (minutes: number) => {
    setExamConfig(prev => ({ ...prev, durationMinutes: minutes }));
  };

  const setAnswerInput = (text: string) => setAnswerInputState(text);

  const setAnswerType = (type: AnswerType) => {
    setExamConfig(prev => ({ ...prev, answerType: type }));
  };

  const parseAnswers = useCallback(() => {
    let type = examConfig.answerType;
    if (!type) {
      type = autoDetectType(answerInput);
      setAnswerType(type);
    }
    
    // Calculate starting index
    const startIndex = parsedAnswers.length > 0 
      ? Math.max(...parsedAnswers.map(a => a.questionNumber)) + 1 
      : 1;

    let newAnswers: AnswerKey[] = [];
    if (type === 'mcq') newAnswers = parseMCQAnswers(answerInput, startIndex);
    else if (type === 'tf') newAnswers = parseTrueFalseAnswers(answerInput, startIndex);
    else if (type === 'short') newAnswers = parseShortAnswers(answerInput, startIndex);
    
    if (newAnswers.length === 0) {
      setParseError('Không tìm thấy đáp án hợp lệ trong đoạn văn bản.');
      return parsedAnswers;
    }

    // Merge logic: overwrite if question number exists, otherwise append
    const mergedMap = new Map<number, AnswerKey>();
    parsedAnswers.forEach(ans => mergedMap.set(ans.questionNumber, ans));
    newAnswers.forEach(ans => mergedMap.set(ans.questionNumber, ans));
    
    const combinedAnswers = Array.from(mergedMap.values()).sort((a, b) => a.questionNumber - b.questionNumber);
    
    const validation = validateAnswerKey(combinedAnswers);
    
    if (!validation.valid) {
      setParseError(validation.errors.join(' '));
    } else {
      setParseError(null);
      setParsedAnswers(combinedAnswers);
      setAnswerInputState(''); // Clear input text
    }
    
    return combinedAnswers;
  }, [answerInput, examConfig.answerType, parsedAnswers]);

  const createExam = async (): Promise<ExamConfig> => {
    let pdfUrl = '';
    
    if (pdfFile) {
      // Convert PDF to base64 data URL for persistent storage
      pdfUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(pdfFile);
      });
    }

    return {
      id: Math.random().toString(36).substring(7),
      title: examConfig.title || 'Đề thi mới',
      classId: examConfig.classId || 'class-default',
      pdfUrl,
      durationMinutes: examConfig.durationMinutes || 45,
      answerKeys: parsedAnswers,
      answerType: examConfig.answerType || 'mcq',
      createdAt: new Date().toISOString(),
      isActive: true,
    };
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 3) as 1 | 2 | 3);
  const prevStep = () => setStep(s => Math.max(s - 1, 1) as 1 | 2 | 3);

  const updateAnswer = (questionNumber: number, newAnswer: string) => {
    setParsedAnswers(prev => prev.map(a => 
      a.questionNumber === questionNumber ? { ...a, answer: newAnswer } : a
    ));
  };

  const deleteAnswer = (questionNumber: number) => {
    setParsedAnswers(prev => prev.filter(a => a.questionNumber !== questionNumber));
  };

  return {
    step,
    examConfig,
    pdfFile,
    setPdfFile,
    setDuration,
    answerInput,
    setAnswerInput,
    parseAnswers,
    answerType: examConfig.answerType,
    setAnswerType,
    parsedAnswers,
    parseError,
    createExam,
    updateAnswer,
    deleteAnswer,
    nextStep,
    prevStep,
  };
}
