const generateId = () => Math.random().toString(36).substr(2, 9);

class LocalEntity {
  constructor(name) {
    this.name = name;
    this.listeners = [];
  }

  get data() {
    const raw = localStorage.getItem(`mock_db_${this.name}`);
    return raw ? JSON.parse(raw) : [];
  }

  set data(value) {
    localStorage.setItem(`mock_db_${this.name}`, JSON.stringify(value));
  }

  notify() {
    this.listeners.forEach(cb => cb());
  }

  subscribe(cb) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  async list(sort = "-created_date", limit = 200) {
    const sorted = [...this.data].sort((a, b) => {
        const da = a.created_date ? new Date(a.created_date) : new Date(0);
        const db = b.created_date ? new Date(b.created_date) : new Date(0);
        return db.getTime() - da.getTime();
    });
    return sorted.slice(0, limit);
  }

  async filter(criteria, sort = "-created_date", limit = 50) {
    const filtered = this.data.filter(item => {
      for (const key in criteria) {
        if (item[key] !== criteria[key]) return false;
      }
      return true;
    });
    const sorted = filtered.sort((a, b) => {
        const da = a.created_date ? new Date(a.created_date) : new Date(0);
        const db = b.created_date ? new Date(b.created_date) : new Date(0);
        return db.getTime() - da.getTime();
    });
    return sorted.slice(0, limit);
  }

  async create(payload) {
    const newItem = { id: generateId(), created_date: new Date().toISOString(), ...payload };
    this.data = [...this.data, newItem];
    this.notify();
    return newItem;
  }

  async update(id, payload) {
    const items = this.data;
    const index = items.findIndex(i => i.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...payload };
      this.data = items;
      this.notify();
      return items[index];
    }
    return null;
  }
}

export const base44 = {
  entities: {
    RoomBooking: new LocalEntity('RoomBooking'),
    Notification: new LocalEntity('Notification'),
    StaffAccount: new LocalEntity('StaffAccount')
  }
};
