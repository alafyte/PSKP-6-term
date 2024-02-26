const fs = require('fs');
const uuid = require('uuid');
const contacts = require('../contacts') || [];

class Contact {

    getAllContacts = async () => await contacts;

    getContact = async id => {
        const contact = await contacts.find(c => c.id === id);
        return contact ? contact : 'Not found'
    };

    addContact = async data => {
        contacts.push({
            id: uuid.v4(),
            name: data.name,
            phone: data.phone
        });
        await this.saveToFile();
        return contacts;
    };

    editContact = async (id, data) => {
        const contact = await contacts.find(c => c.id === id);
        if (contact) {
            contact.name = data.name;
            contact.phone = data.phone;
        }
        await this.saveToFile();
        return contacts;
    };

    deleteContact = async id => {
        const index = contacts.findIndex(c => c.id === id);
        if (index !== -1) {
            contacts.splice(index, 1);
        }
        await this.saveToFile();
        return contacts;
    };

    saveToFile = async () => {
        try {
            await fs.promises.writeFile('./contacts.json', JSON.stringify(contacts, null, 4));
        } catch (err) {
            console.log(err);
        }
    }
}


module.exports = Contact;