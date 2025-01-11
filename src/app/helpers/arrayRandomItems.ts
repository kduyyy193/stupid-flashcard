// eslint-disable-next-line @typescript-eslint/no-explicit-any
const arrayRandomItems = (array: any): any => {
  const randomKeys = Array(3)
    .fill("")
    .map(() => {
      return (
        Math.round(Math.random() * 10) + Math.round(Math.sqrt(array.length))
      );
    });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const randomArray = array.sort((a: any, b: any) => {
    let id_a = a.id;
    let id_b = b.id;
    randomKeys.forEach((key) => {
      const randomNumber = Math.round(Math.random() * 10) + 10;
      id_a = (id_a % key) + randomNumber;
      id_b = (id_b % key) + randomNumber;
    });
    return id_a - id_b;
  });

  return randomArray;
};

export default arrayRandomItems;
