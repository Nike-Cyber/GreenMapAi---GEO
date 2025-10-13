

import React, { useState } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';

interface LoginPageProps {
  onLogin: (user: { username: string, isAdmin: boolean }) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            const isAdmin = username === 'admin' && password === 'admin';
            onLogin({ username, isAdmin });
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-forest-green flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-fade-in-up">
                <div className="bg-cream p-8 rounded-2xl shadow-2xl text-center">
                    <h1 className="text-4xl font-bold text-forest-green mb-2">Welcome to GreenMap</h1>
                    <p className="text-lime-green mb-8">Mapping a greener future, together. 🌍</p>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <Input
                            id="username"
                            label="Username"
                            type="text"
                            placeholder="e.g., eco_warrior or admin"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <Input
                            id="password"
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing In...
                                </div>
                            ) : "Sign In"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;