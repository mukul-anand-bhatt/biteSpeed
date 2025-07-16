import prisma from "../../prisma/client.js";

export const identifyContact = async (req, res) => {
    try {
        const { email, phoneNumber } = req.body;
        const matchingContacts = await prisma.contact.findMany({
            where: {
                OR: [
                    { email: email || undefined },
                    { phoneNumber: phoneNumber || undefined }
                ],
                deletedAt: null
            }
        });

        if (matchingContacts.length === 0) {
            const newContact = await prisma.contact.create({
                data: {
                    email: email || null,
                    phoneNumber: phoneNumber || null,
                    linkPrecedence: 'PRIMARY'
                }
            });

            return res.status(200).json({
                contact: {
                    primaryContatctId: newContact.id,
                    emails: newContact.email ? [newContact.email] : [],
                    phoneNumbers: newContact.phoneNumber ? [newContact.phoneNumber] : [],
                    secondaryContactIds: []
                }
            });
        }

        const allRelatedContacts = await findAllRelatedContacts(matchingContacts);

        const primaryContact = findPrimaryContact(allRelatedContacts);

        const shouldCreateSecondary = shouldCreateNewSecondary(allRelatedContacts, email, phoneNumber);

        let updatedContacts = [...allRelatedContacts];
        if (shouldCreateSecondary) {
            const newSecondary = await prisma.contact.create({
                data: {
                    email: email || null,
                    phoneNumber: phoneNumber || null,
                    linkedId: primaryContact.id,
                    linkPrecedence: 'SECONDARY'
                }
            });
            updatedContacts.push(newSecondary);
        }

        const updatePromises = updatedContacts
            .filter(contact => 
                contact.id !== primaryContact.id && 
                contact.linkPrecedence === 'PRIMARY'
            )
            .map(contact => 
                prisma.contact.update({
                    where: { id: contact.id },
                    data: {
                        linkedId: primaryContact.id,
                        linkPrecedence: 'SECONDARY',
                        updatedAt: new Date()
                    }
                })
            );

        await Promise.all(updatePromises);

        const finalContacts = await findAllRelatedContacts([primaryContact]);

        const response = prepareResponse(primaryContact, finalContacts);

        return res.status(200).json(response);
    } catch (error) {
        console.error("Error in identifyContact:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

async function findAllRelatedContacts(initialContacts) {
    const contactIds = new Set(initialContacts.map(c => c.id));
    const linkedIds = new Set(initialContacts.filter(c => c.linkedId).map(c => c.linkedId));

    const linkedContacts = await prisma.contact.findMany({
        where: {
            OR: [
                { id: { in: Array.from(linkedIds) } },
                { linkedId: { in: Array.from(contactIds) } }
            ],
            deletedAt: null
        }
    });

    const allContacts = [...initialContacts, ...linkedContacts];
    const uniqueContacts = allContacts.filter(
        (contact, index, self) => index === self.findIndex(c => c.id === contact.id)
    );

    return uniqueContacts;
}

function findPrimaryContact(contacts) {
    const primaryContacts = contacts.filter(c => c.linkPrecedence === 'PRIMARY');
    
    if (primaryContacts.length === 1) {
        return primaryContacts[0];
    }

    return primaryContacts.reduce((oldest, current) => 
        current.createdAt < oldest.createdAt ? current : oldest
    );
}

function shouldCreateNewSecondary(contacts, email, phoneNumber) {
    if (!email && !phoneNumber) return false;

    const hasNewEmail = email && !contacts.some(c => c.email === email);
    const hasNewPhone = phoneNumber && !contacts.some(c => c.phoneNumber === phoneNumber);

    return hasNewEmail || hasNewPhone;
}

function prepareResponse(primaryContact, allContacts) {
    const secondaryContacts = allContacts.filter(c => 
        c.id !== primaryContact.id && 
        (c.linkedId === primaryContact.id || c.linkPrecedence === 'SECONDARY')
    );

    const emails = new Set();
    if (primaryContact.email) emails.add(primaryContact.email);
    secondaryContacts.forEach(c => { if (c.email) emails.add(c.email) });

    const phoneNumbers = new Set();
    if (primaryContact.phoneNumber) phoneNumbers.add(primaryContact.phoneNumber);
    secondaryContacts.forEach(c => { if (c.phoneNumber) phoneNumbers.add(c.phoneNumber) });

    return {
        contact: {
            primaryContatctId: primaryContact.id,
            emails: Array.from(emails),
            phoneNumbers: Array.from(phoneNumbers),
            secondaryContactIds: secondaryContacts.map(c => c.id).sort((a, b) => a - b)
        }
    };
}