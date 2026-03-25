const CATEGORY_IMAGES = {
    'Programming': [
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80', // laptop code
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80', // colorful code
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80', // monitor code
        'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=600&q=80', // dark code
        'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=600&q=80', // js code
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80', // matrix
        'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&q=80', // keyboard
    ],
    'Data Science': [
        'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80', // charts
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80', // analytics
        'https://images.unsplash.com/photo-1527474305487-b87b222841cc?w=600&q=80', // data viz
        'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=600&q=80',    // stats
        'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&q=80', // python data
        'https://images.unsplash.com/photo-1591696205602-2f950c417cb9?w=600&q=80', // ml neural
        'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&q=80',    // network graph
    ],
    'Cybersecurity': [
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&q=80', // lock
        'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&q=80', // hacker
        'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=600&q=80', // shield
        'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=600&q=80', // security
        'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&q=80', // network
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80', // server
    ],
    'Cloud Computing': [
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80', // cloud earth
        'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=80', // server rack
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80', // data center
        'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=600&q=80', // devops
        'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=600&q=80', // infrastructure
        'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&q=80', // tech abstract
    ],
    'Design': [
        'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80', // design tools
        'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&q=80', // ux wireframe
        'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=600&q=80', // figma
        'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=600&q=80', // color palette
        'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&q=80', // ui design
        'https://images.unsplash.com/photo-1545235617-9465d2a55698?w=600&q=80', // typography
    ],
};

const DEFAULT_IMAGES = [
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80',
    'https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=600&q=80',
];

/**
 * Returns a unique image for a course based on its category and ID.
 * Courses in the same category get different images by rotating through the array.
 */
export const getCourseImage = (category, courseId = 0) => {
    const images = CATEGORY_IMAGES[category] || DEFAULT_IMAGES;
    return images[courseId % images.length];
};
