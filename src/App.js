import React from 'react';
import './App.css';
import { TodoWrapperLocalStorage } from './components/TodoWrapperLocalStorage';
import axios from 'axios';

function App() {
  const handleClick = async () => {
    const apiUrl = 'http://localhost:5001/trigger-workflow';
    const jobDetails = {
      owner: 'Uxingouo',
      repo: 'TodoList_DockerAndNginx',
      ref: 'main',
      workflow_file_name: 'blog-push.yaml',
      inputs: {
        job_id: 'publish_blog_file',
        file_title: 'xxxx'
      },
    };

    try {
      const response = await axios.post(apiUrl, jobDetails);
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
