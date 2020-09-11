import React from 'react';
import { addDecorator } from '@storybook/react';
import './preview.css';

export const parameters = {
	backgrounds: {
		default: 'lightgray',
		values: [
			{
				name: 'lightgray',
				value: '#f0f0f0'
			},
			{
				name: 'darkgray',
				value: '#4a5258'
			},
		],
	}
};

addDecorator((story) => {
	return (
		<div className='deco-center'>
			{ story() }
		</div>
	);
});