export const MALTA_LOCALITIES = [
	'Mellieħa',
	'Mġarr',
	'San Pawl il-Baħar',
	'Naxxar',
	'Mosta',
	'Birkirkara',
	'Msida',
	'Gżira',
	"Ta' Xbiex",
	'San Ġwann',
	'Swieqi',
	'Iklin',
	'Balzan',
	'Lija',
	'Attard',
	'San Ġiljan',
	'Sliema',
	'Pembroke',
	'Valletta',
	'Floriana',
	'Birgu',
	'Bormla',
	'Isla',
	'Kalkara',
	'Marsaxlokk',
	'Marsaskala',
	'Żejtun',
	'Birżebbuġa',
	'Għajnsielem',
	'Għarb',
	'Għasri',
	'Kerċem',
	'Munxar',
	'Nadur',
	'Qala',
	'San Lawrenz',
	'Sannat',
	'Xagħra',
	'Xewkija',
	'Żebbuġ (Gozo)',
	'Fontana',
];

export const PROPERTY_TYPES = [
	'Apartment',
	'Penthouse',
	'Maisonette',
	'Townhouse',
	'House of Character',
	'Villa',
	'Bungalow',
	'Farmhouse',
	'Palazzo',
];

export const BEDROOM_OPTIONS = [
	'Studio',
	'1 Bedroom',
	'2 Bedrooms',
	'3 Bedrooms',
	'4 Bedrooms',
	'5+ Bedrooms',
];

export const SLEEPS_OPTIONS = ['1-2 Guests', '3-4 Guests', '5-6 Guests', '7-8 Guests', '9+ Guests'];

export const MALTA_REGIONS = [
	{
		label: 'Northern',
		areas: ['Mellieħa', 'Mġarr', 'San Pawl il-Baħar', 'Naxxar', 'Mosta'],
	},
	{
		label: 'Central',
		areas: [
			'Birkirkara',
			'Msida',
			'Gżira',
			"Ta' Xbiex",
			'San Ġwann',
			'Swieqi',
			'Iklin',
			'Balzan',
			'Lija',
			'Attard',
		],
	},
	{
		label: "St Julian's & Sliema",
		areas: ['San Ġiljan', 'Sliema', 'Pembroke'],
	},
	{
		label: 'Valletta & Three Cities',
		areas: ['Valletta', 'Floriana', 'Birgu', 'Bormla', 'Isla', 'Kalkara'],
	},
	{
		label: 'South',
		areas: ['Marsaxlokk', 'Marsaskala', 'Żejtun', 'Birżebbuġa'],
	},
	{
		label: 'Gozo',
		areas: [
			'Għajnsielem',
			'Għarb',
			'Għasri',
			'Kerċem',
			'Munxar',
			'Nadur',
			'Qala',
			'San Lawrenz',
			'Sannat',
			'Xagħra',
			'Xewkija',
			'Żebbuġ (Gozo)',
			'Fontana',
		],
	},
];

export const TIMELINE_OPTIONS = [
	{ value: 'asap', label: 'ASAP - Ready to list now' },
	{ value: '1-3months', label: '1-3 months' },
	{ value: '3-6months', label: '3-6 months' },
	{ value: 'exploring', label: 'Just exploring options' },
];

export const GOAL_OPTIONS = [
	{ value: 'max_income', label: 'Maximum rental income' },
	{ value: 'hands_off', label: 'Completely hands-off management' },
	{ value: 'flexibility', label: 'Flexible usage for personal stays' },
	{ value: 'investment', label: 'Long-term investment growth' },
];

export const BUDGET_OPTIONS = [
	{ value: '0-5k', label: '€0 - €5,000' },
	{ value: '5k-15k', label: '€5,000 - €15,000' },
	{ value: '15k-30k', label: '€15,000 - €30,000' },
	{ value: '30k+', label: '€30,000+' },
];

export const CONTACT_OPTIONS = [
	{ value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
	{ value: 'phone', label: 'Phone Call', icon: '📞' },
	{ value: 'email', label: 'Email', icon: '📧' },
];
