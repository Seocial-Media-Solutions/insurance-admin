import { createContext, useContext, useState } from 'react';

const ContactContext = createContext();

export function ContactProvider({ children }) {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Add a new contact
  const addContact = (contact) => {
    setContacts(prev => [...prev, { ...contact, id: Date.now() }]);
  };

  // Update existing contact
  const updateContact = (id, updatedContact) => {
    setContacts(prev => 
      prev.map(contact => 
        contact.id === id ? { ...contact, ...updatedContact } : contact
      )
    );
  };

  // Delete contact
  const deleteContact = (id) => {
    setContacts(prev => prev.filter(contact => contact.id !== id));
    if (selectedContact?.id === id) {
      setSelectedContact(null);
    }
  };

  // Get contact by ID
  const getContactById = (id) => {
    return contacts.find(contact => contact.id === id);
  };

  const value = {
    contacts,
    setContacts,
    selectedContact,
    setSelectedContact,
    isLoading,
    setIsLoading,
    addContact,
    updateContact,
    deleteContact,
    getContactById
  };

  return (
    <ContactContext.Provider value={value}>
      {children}
    </ContactContext.Provider>
  );
}

// Custom hook to use the contact context
export function useContact() {
  const context = useContext(ContactContext);
  if (!context) {
    throw new Error('useContact must be used within a ContactProvider');
  }
  return context;
}