# Documentation of tricks and methods

I do not intend this to be a text-book, more like a reference.

## JS

### Functions:

```js
const function1 = (arg1, arg2) =>{
    // handle arg1, arg2, create result
    return result
}
```

or

```js
function function2(arg1, arg2){
    // handle arg1,arg2
    return result
}
```

## JSX

### Event handlers:

```jsx
<span onClick={function1}>This can be clicked</span>
<span onClick={function2}>This can be clicked</span>
```

All event handlers expect the argument to be a function (not a return value) of form
`fun(e: Event)->?`

Clicks are propagated/bubbled up to all parent components/elements.
To stop this do either:

```jsx
const function1Enhanced=(e)=>{
    e.stopPropagation()
    function1()
}
<span onClick={function1Enhanced}> This can be clicked</span>
```
or 
```jsx
<span onClick={(e)=>{e.stopPropagation();function1Enhanced()}}>
```
or my favorite:
```jsx
const captureClick=(func)=>{
    const wrapper=(e)=>{e.stopPropagation();return func()}
    return wrapper
}

<span onClick={captureClick(func)}>This can be clicked</span>
```



List of event handlers that I have used:

- onClick
- (text) input handlers
    - onDoubleClick
    - onChange (input)
    - onBlur
    - onKeyDown
- Drag handlers
    - onDragStart
    - onDragEnd
- Drop handlers
    - onDragOver
    - onDragLeave
    - onDrop

## CSS

## ???