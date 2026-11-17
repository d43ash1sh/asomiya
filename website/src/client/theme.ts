// Loaded in <head> before the page paints, so a saved theme applies without a flash.
import { load, SCRIPT_KEY, THEME_KEY } from './storage';

const theme = load(THEME_KEY);
if (theme === 'light' || theme === 'dark') document.documentElement.dataset['theme'] = theme;

const script = load(SCRIPT_KEY);
if (script === 'as' || script === 'roman') document.documentElement.dataset['script'] = script;
