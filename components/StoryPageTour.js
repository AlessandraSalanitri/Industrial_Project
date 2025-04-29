import React, { useState, useEffect } from 'react';
import Joyride from 'react-joyride';

const StoryPageTour = () => {
  const [run, setRun] = useState(false);
  const [mounted, setMounted] = useState(false); // Wait for client render

  useEffect(() => {
    setMounted(true); // runs on the client side
  
    const user = JSON.parse(localStorage.getItem('user'));
    const email = user?.email;
    const tutorialKey = `hasSeenStoryTutorial:${email}`;
  
    const hasSeenTutorial = localStorage.getItem(tutorialKey);
  
    if (!hasSeenTutorial) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        setRun(true);
      }, 500);
    }
  }, []);
  

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = ['finished', 'skipped'];
  
    if (finishedStatuses.includes(status)) {
      const user = JSON.parse(localStorage.getItem('user'));
      const email = user?.email;
      const tutorialKey = `hasSeenStoryTutorial:${email}`;
      localStorage.setItem(tutorialKey, 'true');
      setRun(false);
    }
  };
  

  const steps = [
    {
      target: 'h1',
      content: 'Welcome to the Story Generator! Let me walk you through...',
    },
    {
      target: '.generate-button',
      content: 'Use this to have AI generate a story from your inputs!',
    },
    {
      target: '.write-own-button',
      content: 'Or write your own story and refine it with AI.',
    },
    {
      target: '.age-input',
      content: 'Start by choosing the child\'s age.',
    },
    {
      target: '.genre-input',
      content: 'Now pick the genre.',
    },
    {
      target: '.reading-lenght-input',
      content: 'Then choose how long you want the story to be.',
    },
    {
      target: '.optional-fields',
      content: 'Optionally, set the tone, moral, setting or main character.',
    },
    {
      target: '.generate-button',
      content: 'Click here and let the story magic begin!',
    },
  ];

  // Avoid SSR issues by not rendering until mounted
  if (!mounted) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      scrollToFirstStep
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: '#6A1B9A',
        },
      }}
    />
  );
};

export default StoryPageTour;
