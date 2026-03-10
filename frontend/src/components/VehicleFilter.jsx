'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

export default function VehicleFilter({ onFilterChange }) {
  const [years, setYears] = useState([]);
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [submodels, setSubmodels] = useState([]);
  const [engines, setEngines] = useState([]);

  const [selected, setSelected] = useState({
    year: '',
    make_id: '',
    model_id: '',
    submodel_id: '',
    engine_id: '',
  });

  const [loading, setLoading] = useState({ makes: false, models: false, submodels: false, engines: false });

  useEffect(() => {
    api.getYears().then((res) => setYears(res.data || [])).catch(() => {});
  }, []);

  const updateSelection = useCallback(async (field, value) => {
    const newSelected = { ...selected, [field]: value };

    if (field === 'year') {
      newSelected.make_id = '';
      newSelected.model_id = '';
      newSelected.submodel_id = '';
      newSelected.engine_id = '';
      setModels([]);
      setSubmodels([]);
      setEngines([]);

      if (value) {
        setLoading((l) => ({ ...l, makes: true }));
        try {
          const res = await api.getMakes({ year: value });
          setMakes(res.data || []);
        } catch { setMakes([]); }
        setLoading((l) => ({ ...l, makes: false }));
      } else {
        setMakes([]);
      }
    }

    if (field === 'make_id') {
      newSelected.model_id = '';
      newSelected.submodel_id = '';
      newSelected.engine_id = '';
      setSubmodels([]);
      setEngines([]);

      if (value && newSelected.year) {
        setLoading((l) => ({ ...l, models: true }));
        try {
          const res = await api.getModels({ year: newSelected.year, make_id: value });
          setModels(res.data || []);
        } catch { setModels([]); }
        setLoading((l) => ({ ...l, models: false }));
      } else {
        setModels([]);
      }
    }

    if (field === 'model_id') {
      newSelected.submodel_id = '';
      newSelected.engine_id = '';
      setEngines([]);

      if (value && newSelected.year && newSelected.make_id) {
        setLoading((l) => ({ ...l, submodels: true }));
        try {
          const res = await api.getSubmodels({
            year: newSelected.year,
            make_id: newSelected.make_id,
            model_id: value,
          });
          setSubmodels(res.data || []);
        } catch { setSubmodels([]); }
        setLoading((l) => ({ ...l, submodels: false }));
      } else {
        setSubmodels([]);
      }
    }

    if (field === 'submodel_id') {
      newSelected.engine_id = '';

      if (value && newSelected.year && newSelected.make_id && newSelected.model_id) {
        setLoading((l) => ({ ...l, engines: true }));
        try {
          const res = await api.getEngines({
            year: newSelected.year,
            make_id: newSelected.make_id,
            model_id: newSelected.model_id,
            submodel_id: value,
          });
          setEngines(res.data || []);
        } catch { setEngines([]); }
        setLoading((l) => ({ ...l, engines: false }));
      } else {
        setEngines([]);
      }
    }

    setSelected(newSelected);
    if (onFilterChange) onFilterChange(newSelected);
  }, [selected, onFilterChange]);

  const clearFilters = () => {
    const empty = { year: '', make_id: '', model_id: '', submodel_id: '', engine_id: '' };
    setSelected(empty);
    setMakes([]);
    setModels([]);
    setSubmodels([]);
    setEngines([]);
    if (onFilterChange) onFilterChange(empty);
  };

  const hasAnyFilter = Object.values(selected).some(Boolean);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Shop by Vehicle</h3>
        {hasAnyFilter && (
          <button onClick={clearFilters} className="text-xs font-medium text-brand-600 hover:text-brand-700">
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Year</label>
          <select
            value={selected.year}
            onChange={(e) => updateSelection('year', e.target.value)}
            className="select-field"
          >
            <option value="">Select Year</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Make</label>
          <select
            value={selected.make_id}
            onChange={(e) => updateSelection('make_id', e.target.value)}
            disabled={!selected.year || loading.makes}
            className="select-field disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="">{loading.makes ? 'Loading...' : 'Select Make'}</option>
            {makes.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Model</label>
          <select
            value={selected.model_id}
            onChange={(e) => updateSelection('model_id', e.target.value)}
            disabled={!selected.make_id || loading.models}
            className="select-field disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="">{loading.models ? 'Loading...' : 'Select Model'}</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Submodel</label>
          <select
            value={selected.submodel_id}
            onChange={(e) => updateSelection('submodel_id', e.target.value)}
            disabled={!selected.model_id || loading.submodels}
            className="select-field disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="">{loading.submodels ? 'Loading...' : 'All Submodels'}</option>
            {submodels.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Engine</label>
          <select
            value={selected.engine_id}
            onChange={(e) => updateSelection('engine_id', e.target.value)}
            disabled={!selected.model_id || loading.engines}
            className="select-field disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="">{loading.engines ? 'Loading...' : 'All Engines'}</option>
            {engines.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
