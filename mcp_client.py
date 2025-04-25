#!/usr/bin/env python3
import os
import sys
import json
import argparse
import requests
from typing import Dict, Any, List, Optional
import uuid

class MCPClient:
    """Client for interacting with the Model Context Protocol API"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        """
        Initialize the MCP client
        
        Args:
            base_url: Base URL of the MCP API
        """
        self.base_url = base_url
        self.context = None
        self.context_file = None
        
    def create_context(self, system_message: Optional[str] = None) -> Dict[str, Any]:
        """
        Create a new conversation context
        
        Args:
            system_message: Optional system message to initialize the context
            
        Returns:
            Created context
        """
        url = f"{self.base_url}/mcp/contexts"
        payload = {}
        
        if system_message:
            payload["system_message"] = system_message
            
        response = requests.post(url, json=payload)
        
        if response.status_code == 200:
            self.context = response.json()
            return self.context
        else:
            print(f"Error creating context: {response.text}")
            return None
    
    def generate_response(self, user_message: str, provider: Optional[str] = None, model: Optional[str] = None) -> Dict[str, Any]:
        """
        Generate a response to a user message
        
        Args:
            user_message: User message to respond to
            provider: Optional provider to use
            model: Optional model to use
            
        Returns:
            Generated response
        """
        # Create context if it doesn't exist
        if not self.context:
            system_message = "You are a medical assistant helping with health insights."
            self.create_context(system_message)
            
        # Add user message to context
        if "messages" not in self.context:
            self.context["messages"] = []
            
        self.context["messages"].append({
            "role": "user",
            "content": user_message,
            "timestamp": 0,  # Will be set by the server
            "message_id": str(uuid.uuid4())
        })
        
        # Prepare request
        url = f"{self.base_url}/mcp/generate"
        payload = {
            "context": self.context,
            "provider": provider,
            "model": model
        }
        
        # Remove None values
        payload = {k: v for k, v in payload.items() if v is not None}
        
        # Send request
        response = requests.post(url, json=payload)
        
        if response.status_code == 200:
            result = response.json()
            self.context = result["context"]
            return result
        else:
            print(f"Error generating response: {response.text}")
            return None
    
    def save_context(self, file_path: str) -> None:
        """
        Save the current context to a file
        
        Args:
            file_path: Path to save the context to
        """
        if not self.context:
            print("No context to save")
            return
            
        with open(file_path, "w") as f:
            json.dump(self.context, f, indent=2)
            
        self.context_file = file_path
        print(f"Context saved to {file_path}")
    
    def load_context(self, file_path: str) -> Dict[str, Any]:
        """
        Load a context from a file
        
        Args:
            file_path: Path to load the context from
            
        Returns:
            Loaded context
        """
        with open(file_path, "r") as f:
            self.context = json.load(f)
            
        self.context_file = file_path
        print(f"Context loaded from {file_path}")
        return self.context
    
    def print_conversation(self) -> None:
        """Print the current conversation"""
        if not self.context or "messages" not in self.context:
            print("No conversation to display")
            return
            
        print("\n" + "="*50)
        print("CONVERSATION:")
        print("="*50)
        
        for msg in self.context["messages"]:
            role = msg["role"].upper()
            content = msg["content"]
            
            if role == "SYSTEM":
                print(f"\n[SYSTEM PROMPT]")
                print(f"{content}")
            elif role == "USER":
                print(f"\n[USER]")
                print(f"{content}")
            elif role == "ASSISTANT":
                print(f"\n[ASSISTANT]")
                print(f"{content}")
                
        print("\n" + "="*50)

def main():
    parser = argparse.ArgumentParser(description="MCP Client")
    parser.add_argument("--api-url", default="http://localhost:8000", help="Base URL of the MCP API")
    
    subparsers = parser.add_subparsers(dest="command", help="Command to run")
    
    # Create context command
    create_parser = subparsers.add_parser("create", help="Create a new context")
    create_parser.add_argument("--system", help="System message")
    create_parser.add_argument("--save", help="Save context to file")
    
    # Load context command
    load_parser = subparsers.add_parser("load", help="Load a context from file")
    load_parser.add_argument("file", help="Context file to load")
    
    # Chat command
    chat_parser = subparsers.add_parser("chat", help="Chat with the model")
    chat_parser.add_argument("--message", help="User message")
    chat_parser.add_argument("--provider", help="Provider to use")
    chat_parser.add_argument("--model", help="Model to use")
    chat_parser.add_argument("--context", help="Context file to use")
    chat_parser.add_argument("--save", help="Save context to file")
    
    args = parser.parse_args()
    
    client = MCPClient(base_url=args.api_url)
    
    if args.command == "create":
        context = client.create_context(system_message=args.system)
        if args.save and context:
            client.save_context(args.save)
            
    elif args.command == "load":
        client.load_context(args.file)
        client.print_conversation()
        
    elif args.command == "chat":
        # Load context if specified
        if args.context:
            try:
                client.load_context(args.context)
            except FileNotFoundError:
                print(f"Context file not found: {args.context}")
                print("Creating a new context...")
        
        # Get message from arguments or prompt
        message = args.message
        if not message:
            message = input("Enter your message: ")
            
        # Generate response
        response = client.generate_response(
            user_message=message,
            provider=args.provider,
            model=args.model
        )
        
        if response:
            # Print conversation
            client.print_conversation()
            
            # Save context if specified
            if args.save:
                client.save_context(args.save)
    else:
        parser.print_help()

if __name__ == "__main__":
    main() 