import React from 'react';
import './App.css';
import { TodoWrapperLocalStorage } from './components/TodoWrapperLocalStorage';
import axios from 'axios';

function App() {
  const handleClick = async () => {
    const apiUrl = 'http://localhost:5001/trigger-workflow';
    const workflowDetails = {
      owner: 'Uxingouo',
      repo: 'TodoList_DockerAndNginx',
      workflow_id: 'blog-push.yaml',
      ref: 'main',
      inputs: {
        exampleInput: 'Example value',
      },
    };

    try {
      const response = await axios.post(apiUrl, workflowDetails);
      console.log('Workflow triggered successfully:', response.data);
    } catch (error) {
      console.error('Failed to trigger the workflow:', error);
    }
  };

  return (
    <div className="App">
      <button onClick={handleClick}>Enable Workflow</button>
      <TodoWrapperLocalStorage/>
    </div>
  );
}

export default App;
