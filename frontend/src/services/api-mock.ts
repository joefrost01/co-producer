// src/services/api-mock.ts
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// Sample data
const artists = [
  {
    id: '1',
    name: 'John Doe',
    band: 'The Examples',
    era: '2010s',
    description: 'A versatile guitarist known for innovative techniques.',
    instrument: 'guitar',
    difficulty: 'moderate',
    tags: ['rock', 'blues'],
    techniques: [
      {
        id: '101',
        artist_id: '1',
        name: 'Fast Picking',
        description: 'A technique to rapidly pick strings.',
        difficulty: 4,
        tab_notation: 'e|--12--12--12--12--|\nB|-----------------|',
        instructions: 'Practice with a metronome starting slowly.',
        progress: { status: 'InProgress' }
      }
    ],
    gear_settings: [],
    media: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const projects = [
  {
    id: '1',
    title: 'My First Project',
    description: 'A sample project to test the application.',
    collaborators: ['1'],
    equipment: [],
    creative_directives: ['Make it sound good'],
    workflow_notes: 'Just a test project',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    has_briefing: false,
    tags: ['test']
  }
];

const gear = [
  {
    id: '1',
    gear_type: 'amp',
    gear_name: 'Test Amp',
    settings: { volume: '7', tone: '5' },
    description: 'A test amplifier',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const tags = ['rock', 'blues', 'test'];

const settings = {
  username: 'Test User',
  email: 'test@example.com',
  theme: 'light',
  defaultInstrument: 'guitar',
  aiMode: 'offline',
  apiKey: '',
  detailedBriefings: true,
  maxTokens: 2000,
  dbLocation: './data/database',
  autoBackup: false,
  backupFrequency: 'weekly'
};

// Mock progress data
const progress = {
  techniques: {
    '101': { status: 'InProgress', updated_at: new Date().toISOString() }
  },
  learningPlan: [],
  recentActivity: []
};

// Setup mock
export function setupMockAPI() {
  const mock = new MockAdapter(axios, { delayResponse: 500 });

  // Artists endpoints
  mock.onGet('/api/artists').reply(200, artists);
  mock.onGet(/\/api\/artists\/\d+/).reply((config) => {
    const id = config.url?.split('/').pop();
    const artist = artists.find(a => a.id === id);
    return artist ? [200, artist] : [404, { message: 'Artist not found' }];
  });
  mock.onPost('/api/artists').reply((config) => {
    const newArtist = JSON.parse(config.data);
    newArtist.id = String(artists.length + 1);
    newArtist.created_at = new Date().toISOString();
    newArtist.updated_at = new Date().toISOString();
    artists.push(newArtist);
    return [201, newArtist];
  });
  mock.onPut(/\/api\/artists\/\d+/).reply((config) => {
    const id = config.url?.split('/').pop();
    const index = artists.findIndex(a => a.id === id);
    if (index !== -1) {
      const updatedArtist = { ...JSON.parse(config.data), updated_at: new Date().toISOString() };
      artists[index] = updatedArtist;
      return [200, updatedArtist];
    }
    return [404, { message: 'Artist not found' }];
  });
  mock.onDelete(/\/api\/artists\/\d+/).reply((config) => {
    const id = config.url?.split('/').pop();
    const index = artists.findIndex(a => a.id === id);
    if (index !== -1) {
      artists.splice(index, 1);
      return [204];
    }
    return [404, { message: 'Artist not found' }];
  });

  // Projects endpoints
  mock.onGet('/api/projects').reply(200, projects);
  mock.onGet(/\/api\/projects\/\d+/).reply((config) => {
    const id = config.url?.split('/').pop();
    const project = projects.find(p => p.id === id);
    return project ? [200, project] : [404, { message: 'Project not found' }];
  });
  mock.onPost('/api/projects').reply((config) => {
    const newProject = JSON.parse(config.data);
    newProject.id = String(projects.length + 1);
    newProject.created_at = new Date().toISOString();
    newProject.updated_at = new Date().toISOString();
    projects.push(newProject);
    return [201, newProject];
  });
  mock.onPut(/\/api\/projects\/\d+/).reply((config) => {
    const id = config.url?.split('/').pop();
    const index = projects.findIndex(p => p.id === id);
    if (index !== -1) {
      const updatedProject = { ...JSON.parse(config.data), updated_at: new Date().toISOString() };
      projects[index] = updatedProject;
      return [200, updatedProject];
    }
    return [404, { message: 'Project not found' }];
  });
  mock.onDelete(/\/api\/projects\/\d+/).reply((config) => {
    const id = config.url?.split('/').pop();
    const index = projects.findIndex(p => p.id === id);
    if (index !== -1) {
      projects.splice(index, 1);
      return [204];
    }
    return [404, { message: 'Project not found' }];
  });

  // Project briefing endpoints
  mock.onPost(/\/api\/projects\/\d+\/generate-briefing/).reply((config) => {
    const id = config.url?.split('/')[3];
    const index = projects.findIndex(p => p.id === id);
    if (index !== -1) {
      // Define a proper type for the project with all necessary properties
      const project = projects[index] as {
        id: string;
        title: string;
        description: string;
        collaborators: string[];
        equipment: string[];
        creative_directives: string[];
        workflow_notes: string;
        created_at: string;
        updated_at: string;
        has_briefing: boolean;
        tags?: string[];
      };
      project.has_briefing = true;
      return [200, { message: 'Briefing generated' }];
    }
    return [404, { message: 'Project not found' }];
  });
  mock.onGet(/\/api\/projects\/\d+\/briefing/).reply((config) => {
    const id = config.url?.split('/')[3];
    const project = projects.find(p => p.id === id);
    if (project && project.has_briefing) {
      return [200, {
        id: '1',
        project_id: id,
        content: 'Sample briefing content',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }];
    }
    return [404, { message: 'Briefing not found' }];
  });
  mock.onGet(/\/api\/projects\/\d+\/briefing\/markdown/).reply((config) => {
    const id = config.url?.split('/')[3];
    const project = projects.find(p => p.id === id);
    if (project && project.has_briefing) {
      return [200, `# ${project.title} Briefing\n\nThis is a sample briefing for ${project.title}.\n\n## Overview\n\n${project.description}`];
    }
    return [404, { message: 'Briefing not found' }];
  });
  mock.onGet(/\/api\/projects\/\d+\/briefing\/json/).reply((config) => {
    const id = config.url?.split('/')[3];
    const project = projects.find(p => p.id === id);
    if (project && project.has_briefing) {
      return [200, {
        title: project.title,
        description: project.description,
        collaborators: project.collaborators,
        equipment: project.equipment,
        creative_directives: project.creative_directives
      }];
    }
    return [404, { message: 'Briefing not found' }];
  });

  // Gear endpoints
  mock.onGet('/api/gear').reply(200, gear);
  mock.onGet(/\/api\/gear\/\d+/).reply((config) => {
    const id = config.url?.split('/').pop();
    const item = gear.find(g => g.id === id);
    return item ? [200, item] : [404, { message: 'Gear not found' }];
  });
  mock.onPost('/api/gear').reply((config) => {
    const newGear = JSON.parse(config.data);
    newGear.id = String(gear.length + 1);
    newGear.created_at = new Date().toISOString();
    newGear.updated_at = new Date().toISOString();
    gear.push(newGear);
    return [201, newGear];
  });
  mock.onPut(/\/api\/gear\/\d+/).reply((config) => {
    const id = config.url?.split('/').pop();
    const index = gear.findIndex(g => g.id === id);
    if (index !== -1) {
      const updatedGear = { ...JSON.parse(config.data), updated_at: new Date().toISOString() };
      gear[index] = updatedGear;
      return [200, updatedGear];
    }
    return [404, { message: 'Gear not found' }];
  });
  mock.onDelete(/\/api\/gear\/\d+/).reply((config) => {
    const id = config.url?.split('/').pop();
    const index = gear.findIndex(g => g.id === id);
    if (index !== -1) {
      gear.splice(index, 1);
      return [204];
    }
    return [404, { message: 'Gear not found' }];
  });

  // Tags endpoints
  mock.onGet('/api/tags').reply(200, tags);
  mock.onPost('/api/tags').reply((config) => {
    const { name } = JSON.parse(config.data);
    if (!tags.includes(name)) {
      tags.push(name);
    }
    return [201, name];
  });
  mock.onDelete(/\/api\/tags\/.*/).reply((config) => {
    const tag = decodeURIComponent(config.url?.split('/').pop() || '');
    const index = tags.indexOf(tag);
    if (index !== -1) {
      tags.splice(index, 1);
      return [204];
    }
    return [404, { message: 'Tag not found' }];
  });
  mock.onPost('/api/tags/merge').reply((config) => {
    const { source, target } = JSON.parse(config.data);
    if (tags.includes(source) && tags.includes(target)) {
      tags.splice(tags.indexOf(source), 1);
      return [200, { message: 'Tags merged' }];
    }
    return [404, { message: 'Tag not found' }];
  });

  // Settings endpoints
  mock.onGet('/api/settings').reply(200, settings);
  mock.onPut('/api/settings').reply((config) => {
    const updatedSettings = { ...settings, ...JSON.parse(config.data) };
    Object.assign(settings, updatedSettings);
    return [200, settings];
  });

  // Backup endpoints
  mock.onPost('/api/backup').reply(200, {
    version: '1.0',
    date: new Date().toISOString(),
    settings,
    artists,
    projects,
    gear
  });
  mock.onPost('/api/restore').reply(200, { message: 'Backup restored' });
  mock.onPost('/api/settings/clear-data').reply(200, { message: 'All data cleared' });

  // Progress endpoints
  mock.onGet('/api/progress').reply(200, progress);

  return mock;
}
