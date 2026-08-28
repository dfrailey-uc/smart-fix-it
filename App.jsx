import React, { useState } from 'react';
import { LocationService } from './services/LocationService';
import { RequestService } from './services/RequestService';
import { AIService } from './services/AIService';
import { Affiliations, SpaceRelationships, SpaceTypes } from './types';
import questionConfig from './data/question-config.json';
import './styles/index.css';

const App = () => {
  // --- State ---
  const [formData, setFormData] = useState({
    affiliation: '',
    spaceType: '',
    specificSpace: '',
    location: { name: '', id: '', type: '' },
    relationship: '',
    problemDescription: '',
    photos: [],
    identifiedIssues: [], 
    urgency: '',
    accessInfo: '',
    isBypassed: false,
  });
  const [aiStatus, setAiStatus] = useState(null);
  const [aiStatusData, setAiStatusData] = useState(null);
  const [duplicateAlert, setDuplicateAlert] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showAllBuildings, setShowAllBuildings] = useState(false);

  // --- Helpers ---
  const updateForm = (updates) => setFormData(prev => ({ ...prev, ...updates }));

  const handleProblemChange = (text) => {
    updateForm({ problemDescription: text });
    if (text.length > 10) {
      setAiStatus('interpreting');
      setTimeout(() => processProblem(text), 800);
    }
  };

  const processProblem = (text) => {
    const result = AIService.interpretProblem(text);
    if (result.type === 'diversion') {
      setAiStatus('diversion');
      setAiStatusData(result);
    } else if (result.type === 'multi') {
      setAiStatus('multi');
      setAiStatusData(result);
    } else if (result.type === 'single') {
      setAiStatus('suggesting');
      setAiStatusData(result);
    } else {
      setAiStatus(null);
    }
  };

  const handleAiConfirm = (issue) => {
    const newIssues = [...formData.identifiedIssues, { ...issue, answers: {} }];
    updateForm({ identifiedIssues: newIssues });
    setAiStatus(null);
  };

  const handleAiBypass = () => {
    updateForm({ isBypassed: true });
  };

  const executeSearch = (name, id, type) => {
    updateForm({ location: { name, id, type } });
    const dupes = RequestService.findPotentialDuplicates(
      LocationService.getMaximoId(id), 
      '', 
      formData.problemDescription
    );
    if (dupes.length > 0) setDuplicateAlert(dupes[0]);
    setLocationSuggestions([]); // Clear suggestions after selection
  };

  const handleLocationInputChange = (val) => {
    updateForm({ location: { ...formData.location, name: val } });
    if (!val) {
      setLocationSuggestions([]);
      return;
    }

    const all = LocationService.getAllBuildings();
    const filtered = all.filter(b => b.name.toLowerCase().includes(val.toLowerCase()));
    setLocationSuggestions(filtered);
    setShowAllBuildings(false);
  };

  const handleShowAll = () => {
    const all = LocationService.getAllBuildings();
    setLocationSuggestions(all);
    setShowAllBuildings(true);
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    updateForm({ photos: [...formData.photos, ...files] });
  };

  const submitRequest = async () => {
    setIsSubmitting(true);
    const res = await RequestService.submit(formData);
    setSubmissionResult(res);
    setIsSubmitting(false);
  };

  // --- Sections ---

  const renderIdentity = () => (
    <section className="fade-in">
      <h2>Who is reporting?</h2>
      <p className="muted">Help us tailor the experience to your role at UC San Diego.</p>
      <div className="grid-options">
        {Affiliations.map(a => (
          <div key={a} className={`chip ${formData.affiliation === a ? 'chip-active' : ''}`} onClick={() => updateForm({ affiliation: a })}>{a}</div>
        ))}
      </div>
    </section>
  );

  const renderSpaceType = () => (
    <section className="fade-in">
      <h2>What kind of space is affected?</h2>
      <div className="grid-options">
        {SpaceTypes.map(t => (
          <div key={t} className={`chip ${formData.spaceType === t ? 'chip-active' : ''}`} onClick={() => updateForm({ spaceType: t })}>{t}</div>
        ))}
      </div>
      <div className="specific-space-box">
        <label>Specific space name or details (optional):</label>
        <input 
          type="text" 
          placeholder="e.g. North Wing, 3rd Floor Lab" 
          value={formData.specificSpace}
          onChange={(e) => updateForm({ specificSpace: e.target.value })}
        />
      </div>
    </section>
  );

  const renderLocation = () => {
    const commonLocations = ["Price Center", "Geisel Library", "CSE Building", "Mesa Nueva"];
    return (
      <section className="fade-in">
        <h2>Where is the issue?</h2>
        <div className="search-box">
          <div className="search-input-group">
            <input 
              type="text" 
              placeholder="Start typing a building name..." 
              onChange={(e) => handleLocationInputChange(e.target.value)}
              value={formData.location.name}
            />
            <button className="btn-primary" onClick={() => {
               const res = LocationService.search(formData.location.name);
               if(res) executeSearch(res.name, res.id, res.type);
            }}>Search</button>
          </div>
          
          {locationSuggestions.length > 0 && (
            <div className="location-dropdown fade-in">
              {locationSuggestions.map(loc => (
                <div key={loc.id} className="suggestion-item" onClick={() => executeSearch(loc.name, loc.id, loc.type)}>
                  {loc.name} <span className="muted">{loc.type}</span>
                </div>
              ))}
            </div>
          )}

          <div className="common-locations">
            <div className="common-header">
              <p className="muted">Common locations:</p>
              <button className="btn-text" onClick={handleShowAll}>See all buildings</button>
            </div>
            <div className="grid-options">
              {commonLocations.map(loc => (
                <div key={loc} className="chip" onClick={() => {
                  const res = LocationService.search(loc);
                  if(res) executeSearch(res.name, res.id, res.type);
                }}>{loc}</div>
              ))}
            </div>
          </div>
        </div>

        {formData.location.id && (
          <div className="search-result fade-in">
            Verified Location: <strong style={{color: 'var(--ucs-navy)'}}>{formData.location.name}</strong>
          </div>
        )}

        {duplicateAlert && (
          <div className="duplicate-alert fade-in">
            <p><strong>Possible existing request:</strong> {duplicateAlert.problem}</p>
            <div className="alert-actions">
              <button className="chip" onClick={() => setDuplicateAlert(null)}>Ignore</button>
              <button className="chip chip-active" onClick={() => setSubmissionResult({ requestId: duplicateAlert.id })}>View Existing</button>
            </div>
          </div>
        )}
      </section>
    );
  };

  const renderRelationship = () => (
    <section className="fade-in">
      <h2>Your connection to this location</h2>
      <div className="grid-options">
        {SpaceRelationships.map(r => (
          <div key={r} className={`chip ${formData.relationship === r ? 'chip-active' : ''}`} onClick={() => updateForm({ relationship: r })}>{r}</div>
        ))}
      </div>
    </section>
  );

  const renderProblem = () => {
    return (
      <section className="fade-in">
        <h2>What's going on?</h2>
        <p className="muted">Tell us what you're experiencing. You don't need to know technical terms.</p>
        <textarea 
          placeholder="Describe the issue..." 
          value={formData.problemDescription}
          onChange={(e) => handleProblemChange(e.target.value)}
        />

        <div className="photo-upload-section">
          <label className="photo-label">
            <span>📷 Add Photos</span>
            <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
          </label>
          <div className="photo-preview">
            {formData.photos.map((file, i) => (
              <div key={i} className="photo-chip">{file.name}</div>
            ))}
          </div>
        </div>

        {aiStatus === 'interpreting' && <div className="ai-loader">Smart Fix-It is thinking...</div>}
        {aiStatus === 'suggesting' && (
          <div className="ai-suggestion fade-in">
            <p>It sounds like you're reporting:</p>
            <div className="suggestion-row">
              <span className="suggestion-label">{aiStatusData.issue.label}</span>
              <div className="suggestion-btns">
                <button className="chip chip-active" onClick={() => handleAiConfirm(aiStatusData.issue)}>Yes, that's right</button>
                <button className="chip" onClick={() => setAiStatus(null)}>Change</button>
              </div>
            </div>
          </div>
        )}
        {aiStatus === 'multi' && (
          <div className="ai-suggestion fade-in">
            <p>We found {aiStatusData.issues.length} possible issues:</p>
            <div className="multi-issue-list">
              {aiStatusData.issues.map(iss => (
                <div key={iss.id} className="issue-item">
                  <span>{iss.label}</span>
                  <button className="chip" onClick={() => handleAiConfirm(iss)}>Add</button>
                </div>
              ))}
            </div>
          </div>
        )}
        {aiStatus === 'diversion' && (
          <div className="diversion-panel fade-in">
            <h3 style={{color: 'var(--ucs-navy)'}}>This isn't a maintenance issue</h3>
            <p>{aiStatusData.message}</p>
            <p>Please contact <strong>Residential Housing Services</strong> for immediate key assistance.</p>
            <button className="btn-primary" onClick={() => updateForm({ problemDescription: '', identifiedIssues: [] })}>Clear and Restart</button>
          </div>
        )}
        <button className="btn-secondary" style={{ marginTop: '1rem', display: 'block' }} onClick={handleAiBypass}>
          I'll just describe it (Bypass AI)
        </button>
      </section>
    );
  };

  const renderDetails = () => {
    if (formData.isBypassed) return null;
    if (formData.identifiedIssues.length === 0) return null;
    return (
      <section className="fade-in">
        <h2>Tell us a bit more</h2>
        {formData.identifiedIssues.map((issue, idx) => {
          const config = questionConfig.categories[issue.id];
          if (!config) return null;
          return (
            <div key={idx} className="issue-detail-section">
              <h3 style={{color: 'var(--ucs-navy)'}}>{issue.label}</h3>
              {config.questions.map(q => (
                <div key={q.id} className="question-block">
                  <label>{q.text}</label>
                  {q.type === 'toggle' ? (
                    <div className="toggle-group">
                      {q.options.map(opt => (
                        <button 
                          key={opt} 
                          className={`chip ${issue.answers[q.id] === opt ? 'chip-active' : ''}`}
                          onClick={() => {
                            const updated = [...formData.identifiedIssues];
                            updated[idx].answers[q.id] = opt;
                            updateForm({ identifiedIssues: updated });
                          }}
                        >{opt}</button>
                      ))}
                    </div>
                  ) : (
                    <select 
                      value={issue.answers[q.id] || ''} 
                      onChange={(e) => {
                        const updated = [...formData.identifiedIssues];
                        updated[idx].answers[q.id] = e.target.value;
                        updateForm({ identifiedIssues: updated });
                      }}
                    >
                      <option value="">Select an option...</option>
                      {q.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </section>
    );
  };

  const renderUrgency = () => (
    <section className="fade-in">
      <h2>Urgency Level</h2>
      <div className="grid-options">
        {[
          { id: 'immediate', label: 'Immediate / Serious', desc: 'Needs to be fixed immediately; seriously impacting me or the space.' },
          { id: 'standard', label: 'Standard', desc: 'Needs attention, but not an emergency.' },
          { id: 'minor', label: 'Minor / Low', desc: 'Not urgent (e.g., one light out but others work).' },
        ].map(u => (
          <div key={u.id} className={`urgency-card ${formData.urgency === u.id ? 'chip-active' : ''}`} onClick={() => updateForm({ urgency: u.id })}>
            <strong style={{color: 'var(--ucs-navy)'}}>{u.label}</strong>
            <span className="muted">{u.desc}</span>
          </div>
        ))}
      </div>
    </section>
  );

  const renderAccess = () => {
    let question = "Do you have any special access instructions?";
    if (formData.spaceType === 'Residential') question = "Can maintenance enter your unit if you're not home?";
    if (formData.spaceType === 'Office/Workplace') question = "Are there times when maintenance cannot access this space?";
    if (formData.spaceType === 'Public/Common Space') question = "Are you still near the location?";

    return (
      <section className="fade-in">
        <h2>Access</h2>
        <p>{question}</p>
        <textarea 
          value={formData.accessInfo} 
          onChange={(e) => updateForm({ accessInfo: e.target.value })} 
        />
      </section>
    );
  };

  const renderReview = () => (
    <section className="fade-in">
      <h2>Review your request</h2>
      <div className="review-card">
        <div className="review-item"><strong>Requester:</strong> {formData.affiliation}</div>
        <div className="review-item"><strong>Location:</strong> {formData.location.name} {formData.specificSpace && `(${formData.specificSpace})`}</div>
        <div className="review-item"><strong>Connection:</strong> {formData.relationship}</div>
        <div className="review-item"><strong>Problem:</strong> {formData.problemDescription}</div>
        {formData.photos.length > 0 && (
          <div className="review-item"><strong>Photos:</strong> {formData.photos.length} attached</div>
        )}
        {formData.identifiedIssues.length > 0 && (
          <div className="review-item">
            <strong>Identified Issues:</strong>
            <ul style={{margin: 0, paddingLeft: '1.2rem'}}>{formData.identifiedIssues.map((iss, i) => <li key={i}>{iss.label}</li>)}</ul>
          </div>
        )}
        <div className="review-item"><strong>Urgency:</strong> {formData.urgency}</div>
        <div className="review-item"><strong>Access:</strong> {formData.accessInfo || 'None provided'}</div>
      </div>
      <div className="review-actions">
        <button className="btn-secondary" onClick={() => updateForm({ identifiedIssues: [], problemDescription: '', photos: [] })}>Clear Problem</button>
        <button className="btn-primary" onClick={submitRequest} disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </div>
    </section>
  );

  const renderSuccess = () => (
    <div className="fade-in" style={{ textAlign: 'center' }}>
      <div className="success-icon">✅</div>
      <h2>Request Submitted!</h2>
      <p>Notification sent to <strong style={{color: 'var(--ucs-navy)'}}>{submissionResult?.emailTarget}</strong></p>
      <p>Your Request ID is: <strong style={{ fontSize: '1.2rem' }}>{submissionResult?.requestId}</strong></p>
      <div className="status-timeline">
        <div className="status-step active">Submitted</div>
        <div className="status-step">Reviewed</div>
        <div className="status-step">Assigned</div>
        <div className="status-step">In Progress</div>
        <div className="status-step">Completed</div>
      </div>
      <button className="btn-primary" style={{ marginTop: '2rem' }} onClick={() => window.location.reload()}>Submit Another</button>
    </div>
  );

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 style={{color: 'var(--ucs-navy)'}}>Smart Fix-It</h1>
      </header>
      <main className="main-content">
        {!submissionResult ? (
          <div className="card">
            {renderIdentity()}
            {formData.affiliation && renderSpaceType()}
            {formData.spaceType && renderLocation()}
            {formData.location.id && renderRelationship()}
            {formData.relationship && renderProblem()}
            {renderDetails()}
            {(formData.identifiedIssues.length > 0 || formData.isBypassed) && renderUrgency()}
            {formData.urgency && renderAccess()}
            {formData.accessInfo || (formData.urgency && !formData.accessInfo) ? renderReview() : null}
          </div>
        ) : (
          renderSuccess()
        )}
      </main>
    </div>
  );
};

export default App;
