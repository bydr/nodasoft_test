import React, {memo, useCallback, useRef, useState} from "react";

const URL = "https://jsonplaceholder.typicode.com/users";

type Company = {
  bs: string;
  catchPhrase: string;
  name: string;
};

type User = {
  id: number;
  email: string;
  name: string;
  phone: string;
  username: string;
  website: string;
  company: Company;
  address: any
};

interface IButtonProps {
  onClick: any;
}

const Button = memo(({ onClick }: IButtonProps) => {
  return (
      <button type="button" onClick={onClick}>
        get random user
      </button>
  );
})

Button.displayName = Button.name

interface IUserInfoProps {
  user: User;
}

const UserInfo = memo(({ user }: IUserInfoProps) => {
  return (
      <table>
        <thead>
        <tr>
          <th>Username</th>
          <th>Phone number</th>
        </tr>
        </thead>
        <tbody>
        <tr>
          <td>{user.name}</td>
          <td>{user.phone}</td>
        </tr>
        </tbody>
      </table>
  );
})

UserInfo.displayName = UserInfo.name

const getUser = async (id: number) => fetch(`${URL}/${id}`).then(res => {
  if (!res.ok) {
    return Promise.reject({
      message: `getUser ${res.status}`
    })
  }
  return res.json()
})

function App(): JSX.Element {
  const [item, setItem] = useState<null | Record<number, User>>(null);
  const [error, setError] = useState<string | undefined>(undefined)
  const lastId = useRef<number | null>(null)

  const [isFetching, setIsFetching] = useState(false)

  const receiveRandomUser = async () => {
    const id = Math.floor(Math.random() * (10 - 1)) + 1;

    if (!!item?.[id]) {
      lastId.current = id
      return
    }

    setIsFetching(true)
    try {
      setError(undefined)
      const _user = await getUser(id);
      lastId.current = id
      setItem(prev => !!prev ? {...prev, [id]: _user} : {[id]: _user});
    } catch (error) {
      setError(`Error getUser: ${JSON.stringify(error)}`)
    }
    setIsFetching(false)

  };

  const handleButtonClick = useCallback((
      event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation();
    if (isFetching) {
      console.log("is fetching")
      return
    }
    void receiveRandomUser();
  }, [isFetching])

  return (
      <div>
        <header>Get a random user</header>
        <Button onClick={handleButtonClick} />
        {
            !!error && <p style={{color: "red"}}>{error}</p>
        }
        {
            !!item && !error && <UserInfo user={item[lastId.current as number]} />
        }
      </div>
  );
}

export default App;

/*
* item описан в useState как объект с ключом number, думаю не просто так написано...
* UserInfo должен условно быть вмонтирован, тк начальное значение item - null
* Для "некоего" кэширования пользователей, собираем данные в объект с ключом id (вероятно из-за этого и был использон тип для useState Record) (не думал о том что со временем там соберется куча записей :) )
* оба компонента - Button и UserInfo обернуты в мемо
* handleButtonClick дополнительно обернут в useCallback, тк пробрасывается в Button
* (линтер обычно будет слать варнинги на receiveRandomUser, который не находится в зависимостях, но его тогда нужно тоже оборачивать в useCallback, а это уже другая песня - коллбэк в коллбэке использовать, уточнить за утечку памяти)
* Отлов ошибки через try catch
* Если запрос выполнился с ошибкой, проверяем status и возвращаем reject, пробрасывая ошибку в catch
* Если воспринимать текст 1 в 1, то я не считаю что throttle нужен в этой задаче, поэтому и не писал :)
* п.с. - во-первых тут лучше подойдет debounce, а во-вторых isFetching добавить вполне вариант как-будто
* */