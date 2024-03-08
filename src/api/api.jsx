async function fetchData() {
    const response = await fetch("https://www.mockachino.com/17acefab-0956-47/contacts");
    const Data = await response.json();
    return Data;
}

export default fetchData