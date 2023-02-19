export default class Repository {
  static getInstance<T extends Repository = typeof this>(): T {
    const {name} = this;
    let repository = repositories[name];

    if (!repository) {
      repository = new this();
      repositories[name] = repository;
    }

    return repository as T;
  }
}

const repositories: Record<string, Repository> = {
};