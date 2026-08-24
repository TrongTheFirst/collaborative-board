package learn.domain;

import lombok.EqualsAndHashCode;

import java.util.ArrayList;
import java.util.List;

@EqualsAndHashCode
public class Result<T> {
    private final ArrayList<String> messages = new ArrayList<>();
    private T payload;
    private ResultType resultType = ResultType.SUCCESS;

    public List<String> getErrorMessages() {
        return new ArrayList<>(messages);
    }

    public void addErrorMessage(String message, ResultType resultType) {
        messages.add(message);
        this.resultType = resultType;
    }

    public void addErrorMessage(String format, ResultType resultType, Object... args) {
        messages.add(String.format(format, args));
        this.resultType = resultType;
    }

    public boolean isSuccess() {
        return resultType == ResultType.SUCCESS;
    }

    public ResultType getResultType() {
        return this.resultType;
    }

    public T getPayload() {
        return payload;
    }

    public void setPayload(T payload) {
        this.payload = payload;
    }

}
