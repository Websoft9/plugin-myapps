import { Autocomplete, Chip, TextField } from '@mui/material';
import React from 'react';

function TagsInput({ initialTags = [], initialOptions = [] }) {
    const [tags, setTags] = React.useState(initialTags);
    const [options, setOptions] = React.useState(initialOptions.filter(option => !initialTags.includes(option)));
    const [inputValue, setInputValue] = React.useState('');
    const initialTagsRef = React.useRef(initialTags); // add this line

    const handleDelete = (tagToDelete) => () => {
        setTags((tags) => tags.filter((tag) => tag !== tagToDelete));
        if (initialTagsRef.current.includes(tagToDelete)) { // add this line
            setOptions((options) => [...options, tagToDelete]);
        }
        setInputValue('');
    };

    return (
        <Autocomplete
            multiple
            freeSolo
            options={options}
            value={tags}
            inputValue={inputValue}
            onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
            }}
            onChange={(event, newValue) => {
                setTags(newValue.map(value => value.startsWith('Add ') ? value.slice(4) : value));
                if (newValue.length === 0) {
                    setOptions(initialOptions);
                } else {
                    setOptions(options => options.filter(option => !newValue.includes(option)));
                }
            }}
            filterOptions={(options, params) => {
                const filtered = options.filter((option) =>
                    option.toLowerCase().includes(params.inputValue.toLowerCase())
                );

                if (params.inputValue !== '' && !options.includes(params.inputValue) && !tags.includes(params.inputValue)) {
                    filtered.push("Add " + params.inputValue);
                }

                return filtered;
            }}
            renderOption={(props, option, { inputValue }) => (
                <li {...props} style={{ backgroundColor: option.includes(inputValue) ? '#f0f0f0' : 'white' }}>
                    {option}
                </li>
            )}
            renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} onDelete={handleDelete(option)} />
                ))
            }
            renderInput={(params) => (
                <TextField {...params} variant="outlined" InputProps={{ ...params.InputProps, endAdornment: null }} />
            )}
            openOnFocus
        />
    );
}

export default TagsInput;
