// PS! Replace this with your own channel ID
// If you use this channel ID your app will stop working in the future
const CLIENT_ID = 'JLiWGFp2LQ9CiqAt';

const drone = new ScaleDrone(CLIENT_ID, {
  data: { // Will be sent out as clientData via events
    name: getRandomPotatoName(), // Use potato-themed names
    color: getRandomColor(),
    avatar: getRandomPotatoAvatar(), // Random potato avatar
  },
});

let members = [];

drone.on('open', error => {
  if (error) {
    return console.error(error);
  }
  console.log('Successfully connected to Scaledrone');

  const room = drone.subscribe('observable-room');
  room.on('open', error => {
    if (error) {
      return console.error(error);
    }
    console.log('Successfully joined room');
  });

  room.on('members', m => {
    members = m;
    updateMembersDOM();
  });

  room.on('member_join', member => {
    members.push(member);
    updateMembersDOM();
  });

  room.on('member_leave', ({ id }) => {
    const index = members.findIndex(member => member.id === id);
    members.splice(index, 1);
    updateMembersDOM();
  });

  room.on('data', (text, member) => {
    if (member) {
      addMessageToListDOM(text, member);
    } else {
      // Message is from server
    }
  });
});

drone.on('close', event => {
  console.log('Connection was closed', event);
});

drone.on('error', error => {
  console.error(error);
});

// Potato-themed names generator
function getRandomPotatoName() {
  const potatoes = [
    "🥔Baked Potato🥔", "🥔Mashed Potato🥔", "🥔Sweet Potato🥔", "🥔French Fry🥔",
    "🥔Potato Chip🥔", "🥔Tater Tot🥔", "🥔Loaded Potato🥔", "🥔Potato Wedge🥔",
    "🥔Crispy Potato🥔", "🥔Hash Brown🥔", "🥔Duchess Potato🥔", "🥔Potato Salad🥔",
    "🥔Potato Pancake🥔", "🥔Scalloped Spud🥔", "🥔Roasted Potato🥔", "🥔Potato Skins🥔"
  ];
  return potatoes[Math.floor(Math.random() * potatoes.length)];
}

function getRandomPotatoAvatar() {
  const avatars = [
    'https://usernamerobot.github.io/funnyhatpotato-Photoroom.jpg',
    'https://usernamerobot.github.io/shadow%20potato-Photoroom.png', // Fixed the space
    'https://usernamerobot.github.io/purpulepotato-Photoroom.jpg',
    'https://usernamerobot.github.io/dirty%20potato-Photoroom.jpg' // Fixed the space
  ];
  return avatars[Math.floor(Math.random() * avatars.length)];
}

function getRandomColor() {
  return '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16);
}

//------------- DOM STUFF

const DOM = {
  membersCount: document.querySelector('.members-count'),
  membersList: document.querySelector('.members-list'),
  messages: document.querySelector('.messages'),
  input: document.querySelector('.message-form__input'),
  form: document.querySelector('.message-form'),
};

DOM.form.addEventListener('submit', sendMessage);

function sendMessage() {
  const value = DOM.input.value;
  if (value === '') {
    return;
  }
  DOM.input.value = '';
  drone.publish({
    room: 'observable-room',
    message: value,
  });
}

function createMemberElement(member) {
  const { name, color, avatar } = member.clientData;
  const el = document.createElement('div');
  
  // Create image element
  const img = document.createElement('img');
  img.src = avatar; // Set the avatar image
  img.alt = name; // Set alt text
  el.appendChild(img); // Add image to member element
  
  el.appendChild(document.createTextNode(name));
  el.className = 'member';
  el.style.color = color;
  el.style.fontWeight = 'bold';
  el.style.padding = '5px';
  el.style.borderRadius = '5px';
  el.style.transition = 'background-color 0.3s';
  
  el.addEventListener('mouseover', () => {
    el.style.backgroundColor = '#f0e68c'; // Highlight on hover
  });
  
  el.addEventListener('mouseout', () => {
    el.style.backgroundColor = ''; // Remove highlight
  });
  
  return el;
}

function updateMembersDOM() {
  DOM.membersList.innerHTML = 'Active Members: ';
  members.forEach(member => {
    const el = createMemberElement(member);
    DOM.membersList.appendChild(el);
  });
  DOM.membersCount.innerHTML = members.length;
}

function addMessageToListDOM(text, member) {
  const el = document.createElement('div');
  el.className = 'message';
  el.innerHTML = `<strong>${member.clientData.name}</strong>: ${text}`;
  DOM.messages.appendChild(el);
  DOM.messages.scrollTop = DOM.messages.scrollHeight; // Auto scroll
}
