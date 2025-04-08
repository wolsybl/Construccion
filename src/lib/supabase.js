// filepath: src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lmfqpfajddfzrtqnbnyj.supabase.co'; // Reemplaza con tu URL de Supabase
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtZnFwZmFqZGRmenJ0cW5ibnlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MTA2NjgsImV4cCI6MjA1OTE4NjY2OH0.LW70Mb8uTJK29EEIPPRd7loIz_yggc-Ncec4wrJgGME'; // Reemplaza con tu clave de Supabase

export const supabase = createClient(supabaseUrl, supabaseKey);