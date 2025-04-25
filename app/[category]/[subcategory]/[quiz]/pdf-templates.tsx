"use client";

import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet 
} from '@react-pdf/renderer';
import { Quiz } from '@/types';

// Define interface for questions since it's not in our types
interface Question {
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface QuizPDFProps {
  quiz: Quiz;
  questions: Question[];
  showAnswers?: boolean;
}

interface ResultsPDFProps {
  quiz: Quiz;
  results: {
    totalQuestions: number;
    correctAnswers: number;
    percentage: number;
    timeTaken: number;
  };
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  question: {
    marginBottom: 15,
  },
  questionText: {
    fontSize: 14,
    marginBottom: 10,
  },
  option: {
    fontSize: 12,
    marginBottom: 5,
    paddingLeft: 10,
  },
  answer: {
    fontSize: 12,
    marginTop: 5,
    color: 'green',
  },
  explanation: {
    fontSize: 12,
    marginTop: 5,
    fontStyle: 'italic',
  },
  results: {
    marginTop: 20,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
});

export const QuizPDF: React.FC<QuizPDFProps> = ({ quiz, questions, showAnswers = false }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>{quiz.title}</Text>
      {questions.map((question, index) => (
        <View key={index} style={styles.question}>
          <Text style={styles.questionText}>
            {index + 1}. {question.text}
          </Text>
          {question.options.map((option, optionIndex) => (
            <Text key={optionIndex} style={styles.option}>
              {String.fromCharCode(65 + optionIndex)}. {option}
            </Text>
          ))}
          {showAnswers && (
            <>
              <Text style={styles.answer}>
                Correct Answer: {question.correctAnswer}
              </Text>
              <Text style={styles.explanation}>
                {question.explanation}
              </Text>
            </>
          )}
        </View>
      ))}
    </Page>
  </Document>
);

export const ResultsPDF: React.FC<ResultsPDFProps> = ({ quiz, results }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>{quiz.title} - Results</Text>
      <View style={styles.results}>
        <View style={styles.resultItem}>
          <Text>Total Questions:</Text>
          <Text>{results.totalQuestions}</Text>
        </View>
        <View style={styles.resultItem}>
          <Text>Correct Answers:</Text>
          <Text>{results.correctAnswers}</Text>
        </View>
        <View style={styles.resultItem}>
          <Text>Score Percentage:</Text>
          <Text>{results.percentage}%</Text>
        </View>
        <View style={styles.resultItem}>
          <Text>Time Taken:</Text>
          <Text>{Math.floor(results.timeTaken / 60)}:{(results.timeTaken % 60).toString().padStart(2, '0')}</Text>
        </View>
      </View>
    </Page>
  </Document>
);