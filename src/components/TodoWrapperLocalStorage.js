import React, {useState, useEffect} from 'react'
import { TodoForm } from './TodoForm'
import { v4 as uuidv4 } from 'uuid';
import { Todo } from './Todo';
import { EditTodoForm } from './EditTodoForm';
uuidv4();

export const TodoWrapperLocalStorage = () => {
    const [todos, setTodos] = useState([])

    useEffect(() => {
        const fetchTodos = async () => {
          try {
            const response = await fetch(`http://localhost:5001/todos`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              }
            });
            const savedTodos = await response.json();
            setTodos(savedTodos);
          } catch (err) {
            console.error('Error fetching todos from server:', err);
          }
        };
      
        fetchTodos();
      }, []);
    
    const addTodo = async (todo) => {
        try {
            const response = await fetch('http://localhost:5001/todos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ task: todo }),
            });
            const newTodo = await response.json();
            console.log(newTodo)
            
            setTodos([...todos, newTodo]);
        } catch (err) {
            console.error('Failed to add todo', err);
        }
    }


    const toggleComplete = async (id) => {
        const todoToUpdate = todos.find(todo => todo.id === id);
        try {
            await fetch(`http://localhost:5001/todos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...todoToUpdate, completed: !todoToUpdate.completed }),
            });
            // const updatedTodo = await response.json();
            setTodos(todos.map(todo => todo.id === id ? todoToUpdate : todo));
        } catch (err) {
            console.error('Failed to update todo', err);
        }
    }

    const deleteTodo = async (id) => {
        try {
            await fetch(`http://localhost:5001/todos/${id}`, {
                method: 'DELETE',
            });
            setTodos(todos.filter(todo => todo.id !== id));
        } catch (err) {
            console.error('Failed to delete todo', err);
        }
    }

    const editTodo = id => {
        setTodos(todos.map(todo => todo.id === id ? {...todo, isEditing: !todo.isEditing} : todo))
    }

    const editTask = async (task, id) => {
        try {
            const response = await fetch(`http://localhost:5001/todos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ task }),
            });
            // const updatedTodo = await response.json();
            setTodos(todos.map(todo => todo.id === id ? { ...todo, task, isEditing: false } : todo));
        } catch (err) {
            console.error('Failed to edit todo', err);
        }
    }
  return (
    <div className='TodoWrapper'>
        <h1>Get Things Done!</h1>
        <TodoForm addTodo={addTodo} />
        {todos.map((todo, index) => (
            todo.isEditing ? (
                <EditTodoForm editTodo={editTask} task={todo} />
            ) : (
                <Todo task={todo} 
                key={index} 
                toggleComplete={toggleComplete} 
                deleteTodo={deleteTodo} 
                editTodo={editTodo} />
            )
            
        ))}
         
    </div>
  )
}