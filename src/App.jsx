import { useMemo, useState } from 'react';
import MapView from './MapView.jsx';
import { loadPeople, savePeople, geocode, toCsv } from './api.js';

const STATUSES = ['New', 'Visited', 'Attending', 'Needs follow-up'];
const EMPTY = { name: '', phone: '', address: '', status: 'New', metBy: '', notes: '' };

export default function App() {
  const [people, setPeople] = useState(loadPeople);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [pos, setPos] = useState(null);
  const [focus, setFocus] = useState(null);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('All');
  const [msg, setMsg] = useState('');

  const commit = (list) => {
    setPeople(list);
    savePeople(list);
  };
  const field = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const reset = () => {
    setForm(EMPTY);
    setEditId(null);
    setPos(null);
    setMsg('');
  };

  const submit = (e) => {
    e.preventDefault();
    const rec = { ...form, lat: pos?.lat ?? null, lng: pos?.lng ?? null };
    if (editId) commit(people.map((p) => (p.id === editId ? { ...p, ...rec } : p)));
    else
      commit([
        { ...rec, id: crypto.randomUUID(), dateMet: new Date().toISOString().slice(0, 10) },
        ...people,
      ]);
    reset();
  };

  const findAddress = async () => {
    if (!form.address.trim()) return setMsg('Type an address first.');
    setMsg('Searching…');
    try {
      const r = await geocode(form.address);
      if (r) {
        setPos(r);
        setFocus(r);
        setMsg('Pin placed. Drag it to the exact house.');
      } else setMsg('Address not found. Click the map to place the pin.');
    } catch {
      setMsg('Lookup failed. Click the map to place the pin.');
    }
  };

  const useHere = () =>
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const r = { lat: p.coords.latitude, lng: p.coords.longitude };
        setPos(r);
        setFocus(r);
        setMsg('Pin placed at your current location.');
      },
      () => setMsg('Location is blocked. Allow it in your browser, or click the map.')
    );

  const edit = (p) => {
    setEditId(p.id);
    setForm({ name: p.name, phone: p.phone, address: p.address, status: p.status, metBy: p.metBy, notes: p.notes });
    const at = p.lat != null ? { lat: p.lat, lng: p.lng } : null;
    setPos(at);
    if (at) setFocus(at);
  };

  const remove = (p) => {
    if (confirm(`Delete ${p.name}?`)) commit(people.filter((x) => x.id !== p.id));
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([toCsv(people)], { type: 'text/csv' }));
    Object.assign(document.createElement('a'), { href: url, download: 'people.csv' }).click();
    URL.revokeObjectURL(url);
  };

  const shown = useMemo(() => {
    const s = q.toLowerCase();
    return people.filter(
      (p) =>
        (filter === 'All' || p.status === filter) &&
        [p.name, p.address, p.phone, p.metBy].some((v) => (v || '').toLowerCase().includes(s))
    );
  }, [people, q, filter]);

  return (
    <div className="app">
      <aside className="side">
        <h1>New people</h1>

        <form onSubmit={submit} className="form">
          <h2>{editId ? 'Edit person' : 'Add a person'}</h2>
          <label>Name<input required value={form.name} onChange={field('name')} /></label>
          <label>Phone<input type="tel" value={form.phone} onChange={field('phone')} /></label>
          <label>Address<textarea rows="2" value={form.address} onChange={field('address')} /></label>
          <div className="row">
            <button type="button" onClick={findAddress}>Find on map</button>
            <button type="button" onClick={useHere}>Use my location</button>
          </div>
          <p className="hint">
            {msg || (pos ? 'Pin set. Drag it to adjust.' : 'Or click the map to drop a pin.')}
          </p>
          <label>
            Status
            <select value={form.status} onChange={field('status')}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label>Met by<input value={form.metBy} onChange={field('metBy')} /></label>
          <label>Notes<textarea rows="2" value={form.notes} onChange={field('notes')} /></label>
          <div className="row">
            <button className="primary" type="submit">{editId ? 'Save changes' : 'Add person'}</button>
            {editId && <button type="button" onClick={reset}>Cancel</button>}
          </div>
        </form>

        <div className="list-head">
          <h2>{shown.length} of {people.length}</h2>
          <button onClick={download} disabled={!people.length}>Export CSV</button>
        </div>
        <div className="row">
          <input placeholder="Search name, address, phone" value={q} onChange={(e) => setQ(e.target.value)} />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option>All</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        <ul className="people">
          {shown.length === 0 && <li className="empty">No one yet. Add the first person above.</li>}
          {shown.map((p) => (
            <li key={p.id}>
              <button className="person" onClick={() => p.lat != null && setFocus({ lat: p.lat, lng: p.lng })}>
                <strong>{p.name}</strong>
                <span>{p.address || 'No address'}</span>
                <span className={'tag s-' + p.status.replace(/\W/g, '')}>{p.status}</span>
                {p.lat == null && <span className="nopin">No pin</span>}
              </button>
              <div className="row small">
                <button onClick={() => edit(p)}>Edit</button>
                <button onClick={() => remove(p)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </aside>

      <MapView people={people} draft={pos} focus={focus} onPick={setPos} onSelect={() => {}} />
    </div>
  );
}
