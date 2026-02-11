
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rvsgcrwcjpftzpdjjxbf.supabase.co';
const supabaseKey = 'sb_publishable_NopuUASlXBJnIjHfgA-_Mg__PK4uN37';

export const supabase = createClient(supabaseUrl, supabaseKey);
